import express from 'express';
import multer from 'multer';
import { isLoggedIn } from '../helpers/middlewares';
import { BackgroundModel } from '../models/background';
import { UserModel } from '../models/user';
import { LogModel } from '../models/log';
import { LogCategory } from '../../interfaces/log';
import cloudinary from '../helpers/cloudinary';

const backgroundsRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2.5 * 1024 * 1024 } });
const maxUploadsPerMonth = 40;

function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseTags(input: string): string[] {
    return (input || '')
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter((t, i, arr) => t.length && arr.indexOf(t) === i);
}

function uploadToCloudinary(buffer: Buffer, name: string): Promise<{ secure_url: string }> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: 'backgrounds',
            public_id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            transformation: [{ width: 2560, height: 1440, crop: 'limit' }],
        }, (error, result) => {
            if (error || !result) reject(error);
            else resolve(result);
        });
        stream.end(buffer);
    });
}

/* GET approved non-hidden bgs and user's own regardless of status */
backgroundsRouter.get('/', async (req, res) => {
    const sortDirection = req.query.sort === 'oldest' ? 1 : -1;
    const isMine = req.query.creator === 'me';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const skip = parseInt(req.query.skip as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 8;

    let query: any;

    if (isMine) {
        if (!req.session.mongoId) {
            return res.json([]);
        }

        query = { user: req.session.mongoId };
    } else {
        const publicClause = { approved: true, hidden: { $ne: true } };
        query = req.session.mongoId ? { $or: [publicClause, { user: req.session.mongoId }] } : publicClause;
    }

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), 'i');
        const matchingUsers = await UserModel.find({ username: searchRegex }).select('_id');

        query = {
            $and: [
                query,
                { $or: [{ name: searchRegex }, { tags: searchRegex }, { user: { $in: matchingUsers.map(u => u._id) } }] },
            ],
        };
    }

    const backgroundsQuery = BackgroundModel
        .find(query)
        .defaultPopulate()
        .sort({ createdAt: sortDirection });

    if (!isMine) {
        backgroundsQuery.skip(skip).limit(limit);
    }

    res.json(await backgroundsQuery);
});

/* POST submit bg for approval */
backgroundsRouter.post('/create', isLoggedIn, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.json({ error: 'Image must be 2.5MB or smaller!' });
            }

            return res.json({ error: 'Upload failed!' });
        }

        next();
    });
}, async (req, res) => {
    const name = req.body.name?.trim();
    const externalLink = req.body.link?.trim();

    if (!name || (!req.file && !externalLink)) {
        return res.json({ error: 'Missing name or image' });
    }

    if (externalLink && !/^https?:\/\//i.test(externalLink)) {
        return res.json({ error: 'Not a valid image URL' });
    }

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const recentUploadCount = await BackgroundModel.countDocuments({
        user: req.session.mongoId,
        createdAt: { $gte: oneMonthAgo },
    });

    if (recentUploadCount >= maxUploadsPerMonth) {
        return res.json({ error: `You've hit the limit of ${maxUploadsPerMonth} background submissions per month. Try again later!` });
    }

    const existing = await BackgroundModel.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });

    if (existing) {
        return res.json({ error: `Someone else's background has that name already. Choose another one!` });
    }

    const link = req.file ? (await uploadToCloudinary(req.file.buffer, name)).secure_url : externalLink;

    const background = new BackgroundModel();
    background.name = name;
    background.link = link;
    background.user = req.session.mongoId;
    background.tags = parseTags(req.body.tags);
    await background.save();

    LogModel.generate(req.session.mongoId, `submitted background "${name}" for approval`, LogCategory.Background);

    res.json(await background.populate({ path: 'user', select: 'username osuId' }));
});

/* POST toggle bg hidden */
backgroundsRouter.post('/:id/toggleHidden', isLoggedIn, async (req, res) => {
    const background = await BackgroundModel.findById(req.params.id).orFail();

    if (background.user.toString() !== req.session.mongoId) {
        return res.json({ error: `That's not your background!` });
    }

    background.hidden = !background.hidden;
    await background.save();

    res.json(await background.populate({ path: 'user', select: 'username osuId' }));
});

export default backgroundsRouter;

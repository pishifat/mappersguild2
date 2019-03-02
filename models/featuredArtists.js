const mongoose = require('mongoose');
const logs = require('./log');

const featuredArtistSchema = new mongoose.Schema({
    label: { type: String, required: true },
    osuId: { type: Number },
    songs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const FeaturedArtist = mongoose.model('FeaturedArtist', featuredArtistSchema);

const featuredSongSchema = new mongoose.Schema({
    artist: { type: String, required: true },
    title: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const FeaturedSong = mongoose.model('FeaturedSong', featuredSongSchema);

class FeaturedArtistService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = FeaturedArtist.find(params);
        } else {
            query = FeaturedArtist.findOne(params);
        }
        
        if (populate) {
            for (let i = 0; i < populate.length; i++) {
                const p = populate[i];
                
                if (p.innerPopulate) {
                    query.populate({ path: p.innerPopulate, populate: p.populate });
                } else {
                    query.populate(p.populate, p.display);
                }
            }
        }

        if (sorting) {
            query.sort(sorting);
        }
        
        try {
            return await query.exec();
        } catch(error) {
            logs.service.create(null, error, null, 'error');            
            return { error: error._message };
        }
    }

    async querySong(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = FeaturedSong.find(params);
        } else {
            query = FeaturedSong.findOne(params);
        }
        
        if (populate) {
            for (let i = 0; i < populate.length; i++) {
                const p = populate[i];
                
                if (p.innerPopulate) {
                    query.populate({ path: p.innerPopulate, populate: p.populate });
                } else {
                    query.populate(p.populate, p.display);
                }
            }
        }

        if (sorting) {
            query.sort(sorting);
        }
        
        try {
            return await query.exec();
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async update(id, update) {
        try {
            return await FeaturedArtist.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async updateSong(id, update) {
        try {
            return await FeaturedSong.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async remove(id) {
        try {
            return await FeaturedArtist.findByIdAndRemove(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async removeSong(id) {
        try {
            return await FeaturedSong.findByIdAndRemove(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async createArtist(label, osuId) {
        try {
            return await FeaturedArtist.create({ 
                label: label,
                osuId: osuId
            });
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async createSong(artist, title) {
        try {
            return await FeaturedSong.create({ 
                artist: artist,
                title: title
            });
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }
}

const service = new FeaturedArtistService();

module.exports = { service };
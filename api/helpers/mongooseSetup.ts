import mongoose from 'mongoose';

// must be imported before compiling app. only affects dev

mongoose.set('strictPopulate', false);

mongoose.plugin(schema => {
    schema.pre('findOneAndUpdate', function (this: any) {
        if (!('returnDocument' in this.options)) {
            this.setOptions({ returnDocument: 'after' });
        }
    });
});

import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const sessionSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: [true, "Session title is required"],
            trim: true
        },
        description: { 
            type: String, 
            required: [true, "Description is required"] 
        },
        category: { 
            type: String, 
            required: [true, "Category is required"],
            enum: ['Technology', 'Language', 'Arts', 'Music', 'Fitness', 'Other'] // Predefined tags
        },
        thumbnail: { 
            type: String, //from clouidinary
            required: [true, "Thumbnail URL is required"] 
        },
        location: { 
            type: String, 
            required: [true, "Location or meeting link is required"] 
        },
        status: { 
            type: String, 
            enum: ['Open', 'Full', 'Completed'], // Session Status Toggles
            default: 'Open' 
        },
        date: { 
            type: Date, 
            required: [true, "Date and time are required"] 
        },
        host: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        // Array of attendees acts as both the current roster and the history log
        attendees: [
            { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            }
        ]
    }, 
    { timestamps: true }
);

sessionSchema.plugin(mongooseAggregatePaginate)

export const Session = mongoose.model('Session', sessionSchema);
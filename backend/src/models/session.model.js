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
            enum: ['Development', 'Design', 'Languages', 'Electronics', 'Other'] // Predefined tags
        },
        thumbnail: { 
            type: String, //from clouidinary
            required: [true, "Thumbnail URL is required"] 
        },
        sessionLocation: {
        type: String,
        enum: ["online", "in-person"],
        required: true
        },
        meetingUrl: {
            type: String,
            trim: true,
            // 1. First, Mongoose checks if it's required based on the location
            required: function() { 
                return this.sessionLocation === 'online'; 
            },
            // 2. Then, IF a link is provided, it must match this rule
            match: [
                /^https?:\/\/.+/, 
                "Please provide a valid meeting link starting with http:// or https://"
            ]
        },
        physicalLocation: {
            type: String,
            trim: true,
            required: function() {
                return this.sessionLocation === 'in-person';
            }
        },
        duration: {
            type: Number, // Best to store it as minutes (e.g., 60, 90, 120)
            required: true,
            default: 60
        },
        maxAttendees: {
            type: Number,
            required: true,
            default: 10
        },
        status: { 
            type: String, 
            enum: ['Open', 'Full', 'Completed', 'Cancelled'], // Session Status Toggles
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
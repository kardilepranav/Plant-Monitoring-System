import mongoose, { Schema } from "mongoose";

const Dbfile = new Schema({
    machno:Number,
    machdate:Date,
    emergenyrepair:String,
    working:String
});

export const MachineDetails = mongoose.model("MachineDetail",Dbfile);
import exp from "constants";
import mongoose, {Schema} from "mongoose";

const seguidorSchema = new Schema({
    usuarioId: {type : String, required : true},
    usuarioSeguidoId: {type : String, required : true}
});

export const seguidoresModel = (mongoose.models.seguidores ||
    mongoose.model('seguidores', seguidorSchema))
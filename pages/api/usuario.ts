import type {NextApiRequest, NextApiResponse} from 'next';
import type { respostaPadraoMsg } from '../../types/respostaPadraoMsg';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB'
import { usuarioModel } from '../../models/usuarioModel';


const usuarioEndPoint = async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg | any>) =>{

    try{
        const {userId} = req?.query;   
        const usuario = await usuarioModel.findById(userId);
        usuario.senha = null;
        return res.status(200).json(usuario);
    }catch(e){
        console.log(e);
        return res.status(400).json({error : "Não foi possível obter os dados do usuário"});
    }
}

export default validarTokenJWT(usuarioEndPoint);

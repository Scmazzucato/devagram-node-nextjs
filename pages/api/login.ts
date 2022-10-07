import type {NextApiRequest, NextApiResponse} from 'next';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import {respostaPadraoMsg} from '../../types/respostaPadraoMsg';
import {loginResposta} from '../../types/loginResposta';
import md5 from 'md5';
import {usuarioModel} from '../../models/usuarioModel';
import jwt from 'jsonwebtoken';

const endpointLogin = async(
    req : NextApiRequest, 
    res : NextApiResponse<respostaPadraoMsg | loginResposta>
) => {
    
    const {MINHA_CHAVE_JWT} = process.env as any;
    if(!MINHA_CHAVE_JWT){
        res.status(500).json({error : 'ENV Jwt não informado'})
    };

    if(req.method == 'POST'){
        const {login, senha} = req.body;

        const usuariosEncontrados = await usuarioModel.find({email : login, senha : md5(senha)})
        if(usuariosEncontrados && usuariosEncontrados.length > 0){
            const usuarioEncontrado = usuariosEncontrados[0];
            const token = jwt.sign({_id : usuarioEncontrado._id}, MINHA_CHAVE_JWT);
            return res.status(200).json({
                nome : usuarioEncontrado.nome, 
                email : usuarioEncontrado.email,    
                token})
        }
        return res.status(400).json({error : 'Usuário ou senha não encontrado'});
    }
    return res.status(405).json({error : 'Método informado inválido'});
}

export default conectarMongoDB(endpointLogin);
import type {NextApiRequest, NextApiResponse} from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { usuarioModel } from '../../models/usuarioModel';
import {respostaPadraoMsg} from '../../types/respostaPadraoMsg'

const pesquisaEndpoint = async(req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg | any>) =>{
    try{
        if(req.method === 'GET'){
            if(req?.query?.id){
                const usuarioEncontrado = await usuarioModel.findById(req?.query?.id)
                if(!usuarioEncontrado){
                    return res.status(400).json({error : 'Usuário não encontrado'})
                };
                usuarioEncontrado.senha = null;
                return res.status(200).json(usuarioEncontrado);
            }else{
                const {filtro} = req.query;
            if(!filtro || filtro.length <2){
                return res.status(400).json({error : 'Favor informar ao menos 2 caracteres para a busca'})
            };

            const usuariosEncontrados = await usuarioModel.find({
                $or: [{nome : {$regex : filtro, $options: 'i'}},
                    { email : {$regex : filtro, $options: 'i'}}]
            });
            return res.status(200).json({usuariosEncontrados});
            };

        };
        return res.status(405).json({error : 'Metódo informado não é válido'})
    }catch(e){
        return res.status(500).json({error :'Não foi possível buscar usuário'})
    }
};

export default validarTokenJWT(conectarMongoDB(pesquisaEndpoint));
import type {NextApiRequest, NextApiResponse} from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { publicacaoModel } from '../../models/publicacaoModel';
import { usuarioModel } from '../../models/usuarioModel';
import {respostaPadraoMsg} from '../../types/respostaPadraoMsg'

const likeEndpoint = async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) =>{
    try{

        if(req.method === 'PUT'){

            const {id} = req?.query;
            const publicacao = await publicacaoModel.findById(id);
            if(!publicacao){
                res.status(400).json({error : 'Publicação não encontrada'});
            };

            const {userId} = req?.query;
            const usuario = await usuarioModel.findById(userId);
            if(!usuario){
                return res.status(400).json({error : 'Usuário não encontrada'});
            };

            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e : any) => e.toString() === usuario._id.toString());

            // se o index for > -1 sinal q ele ja curte a foto
            if(indexDoUsuarioNoLike != -1){
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await publicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicacao descurtida com sucesso'});
            }else {
                // se o index for -1 sinal q ele nao curte a foto
                publicacao.likes.push(usuario._id);
                await publicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicacao curtida com sucesso'});
            }
        }

        return res.status(405).json({error : 'Método inválido'});

    }catch(e){
        console.log(e);
        return res.status(500).json({error : 'Ocorreu um erro ao curtir/descurtir a publicação'});
    };
};

export default validarTokenJWT(conectarMongoDB(likeEndpoint));
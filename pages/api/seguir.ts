import type {NextApiRequest, NextApiResponse} from 'next';
import { json } from 'stream/consumers';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { seguidoresModel } from '../../models/seguidoresModel';
import { usuarioModel } from '../../models/usuarioModel';
import type {respostaPadraoMsg} from '../../types/respostaPadraoMsg';

const endpointSeguir = async (req: NextApiRequest, res: NextApiResponse<respostaPadraoMsg>) => {
    try{
        if(req.method === 'PUT'){

            const {userId, id} = req?.query;

            const usuarioLogado = await usuarioModel.findById(userId);

            if(!userId){
                return res.status(400).json({error : "Usuário logado não encontrado"});
            };

            const usuarioASerSeguido = await usuarioModel.findById(id);

            if(!id){
                return res.status(400).json({error : "Usuário a ser seguido não encontrado"});
            };

            const euJaSigoEsseUser = await seguidoresModel.find
            ({usuarioId : usuarioLogado._id,usuarioSeguidoId : usuarioASerSeguido._id});
            if(euJaSigoEsseUser && euJaSigoEsseUser.length>0){
                euJaSigoEsseUser.forEach(async(e : any) => await seguidoresModel.
                findByIdAndDelete({_id : e._id}));
                usuarioLogado.seguindo--;
                await seguidoresModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores--;
                await seguidoresModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : "Deixou de seguir o usuário com sucesso"});
            }else{
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                };
                await seguidoresModel.create(seguidor);
                usuarioLogado.seguindo++;
                await usuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores++;
                await usuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);
                return res.status(200).json({msg : "Usuário seguido com sucesso"})
            }
        };
        return res.status(405).json({error : "Método informado não existe"})
    }catch(e){
        console.log(e);
        return res.status(500).json({error : "Não foi possível seguir/deseguir o usuário informado"});
    }
}

export default validarTokenJWT(conectarMongoDB(endpointSeguir));
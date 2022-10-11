import type {NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../types/respostaPadraoMsg';
import nc from 'next-connect';
import {updload,uploadImagemCosmic} from '../../services/uploadImagemCosmic';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import {publicacaoModel} from '../../models/publicacaoModel';
import {usuarioModel} from '../../models/usuarioModel';


const handler = nc()
    .use(updload.single('file'))
    .post(async (req : any, res : NextApiResponse<respostaPadraoMsg>) =>{

        try{
            const {userId} = req.query;
            const usuario = await usuarioModel.findById(userId);
            if(!usuario){
                res.status(400).json({error : 'Usuário não encontrado'});
            };

            if(!req || !req.body){
                res.status(400).json({error : 'Parâmetro de entrada não informado'});
            };

            const {descricao} = req?.body;

            if(!descricao || descricao.length <2){
                res.status(400).json({error : 'Descrição inválida'});
            };
    
            if(!req.file || !req.file.originalname){
                return res.status(400).json({error : 'Imagem e obrigatoria'});
            }

            const image = await uploadImagemCosmic(req);
            const publicacao = {
                idUsuario : usuario._id,
                descricao,
                foto : image.media.url,
                data : new Date()
            }
            
            await publicacaoModel.create(publicacao);
    
            return res.status(200).json({msg : 'Publicação bem sucedida'});
    
        }catch(e){
            console.log(e)
            res.status(400).json({error : 'Erro ao cadastrar publicação'});
        };
});

export const config = {
    api : {
        bodyParser : false
    }
};

export default validarTokenJWT(conectarMongoDB(handler));
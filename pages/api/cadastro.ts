import type {NextApiRequest, NextApiResponse} from 'next';
import type {respostaPadraoMsg} from '../../types/respostaPadraoMsg';
import type {cadastroRequisicao} from '../../types/cadastroRequisicao';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import {usuarioModel} from '../../models/usuarioModel';
import md5 from 'md5';
import {upload, uploadImagemCosmic} from '../../services/uploadImagemCosmic';
import nc from 'next-connect';

const handler = nc()
    .use(upload.single('file'))
    .post(async (
        req : NextApiRequest,
        res : NextApiResponse<respostaPadraoMsg> 
    ) => {
        try{
            console.log('cadastro endpoint', req.body);
            const usuario = req.body as cadastroRequisicao;
            if(!usuario.nome || usuario.nome.length < 2){
                return res.status(400).json({error : 'Nome inválido'})
            }
            if(!usuario.email || usuario.email.length < 5 ||
                !usuario.email.includes('@') || !usuario.email.includes('.')){
                return res.status(400).json({error : 'Email inválido'})
            }
            if(!usuario.senha || usuario.senha.length < 4){
                return res.status(400).json({error : 'Senha Inválida'})
            }
            // validação de já existe usuario com o mesmo email
            const usuariosComMesmoEmail = await usuarioModel.find({email : usuario.email});
            if(usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0){
                return res.status(400).json({error : 'Já existe uma conta com o email informado'})
            };
            // checa se chegou alguma imagem
            // salvar imagem do multer para o cosmic
            const image = await uploadImagemCosmic(req);
            console.log('endpoint img', image);
            
            // salvar no banco de dados
            const usuarioASerSalvo = {
                nome : usuario.nome,
                email : usuario.email,
                senha : md5(usuario.senha),
                avatar : image.media.url
            };
            await usuarioModel.create(usuarioASerSalvo);
            return res.status(200).json({msg : 'Usuário criado com sucesso'})
        }catch(e){
            console.log(e);
            return res.status(500).json({error : 'Erro ao criar usuário'});
        }
    });

export const config = {
    api : {
        bodyParser : false
    }
};

export default conectarMongoDB(handler);
import multer from "multer";
import cosmicjs from 'cosmicjs';

const {
    CHAVE_DE_GRAVACAO_DOS_AVATARES,
    CHAVE_DE_GRAVACAO_DAS_PUBLICACOES,
    BUCKET_AVATARES,
    BUCKET_PUBLICACOES,} = process.env;

const Cosmic = cosmicjs();
const bucketAvatares = Cosmic.bucket({
    slug : BUCKET_AVATARES,
    writeKey : CHAVE_DE_GRAVACAO_DOS_AVATARES
});
const bucketPublicacoes = Cosmic.bucket({
    slug : BUCKET_PUBLICACOES,
    writeKey : CHAVE_DE_GRAVACAO_DAS_PUBLICACOES 
});

const storage = multer.memoryStorage();
const upload = multer({storage : storage});

const uploadImagemCosmic = async(req : any) =>{
    console.log('uploadImagemCosmic', req);
    if(req?.file?.original_name){
        const media_object = {
            original_name : req.file.original_name,
            buffer : req.file.buffer
        };  
        console.log('uploadImagemCosmic url', req.url);
        console.log('uploadImagemCosmic media_object', media_object)
        if(req.url && req.url.includes('publicacao')){
            return await bucketPublicacoes.addMedia({media : media_object})
        }else{
            return await bucketAvatares.addMedia({media : media_object})
        };
    };
};

export {upload, uploadImagemCosmic};
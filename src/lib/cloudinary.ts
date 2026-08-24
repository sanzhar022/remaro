import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { serverEnv } from "@/lib/env";

function credentials() {
  const cloud_name=serverEnv.CLOUDINARY_CLOUD_NAME, api_key=serverEnv.CLOUDINARY_API_KEY, api_secret=serverEnv.CLOUDINARY_API_SECRET;
  cloudinary.config({cloud_name,api_key,api_secret,secure:true}); return cloudinary;
}
export function uploadImage(buffer:Buffer,folder:string){return new Promise<UploadApiResponse>((resolve,reject)=>{const stream=credentials().uploader.upload_stream({folder,resource_type:"image",unique_filename:true,use_filename:false},(error,result)=>error||!result?reject(error??new Error("UPLOAD_FAILED")):resolve(result));stream.end(buffer);});}
export async function deleteImage(publicId:string){const result=await credentials().uploader.destroy(publicId,{resource_type:"image",invalidate:true});if(!["ok","not found"].includes(result.result))throw new Error("DELETE_FAILED");}
export const cloudinaryConfigured=()=>true;

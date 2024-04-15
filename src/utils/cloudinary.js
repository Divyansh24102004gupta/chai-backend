import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

// it takes the file from our server and put it on cloudinary and than remove the file from server
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null;
        }
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //now file has been uploaded so unlink it
        // console.log("file is uploaded on cloudinary !",response.url);

        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the localy saved temporary file if the upload action get failed
        return null;
        }
}

export {uploadOnCloudinary} 
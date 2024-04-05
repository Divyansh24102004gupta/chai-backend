import { Router } from "express";
import {registorUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/registor").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverimage",
            maxCount:1
        }
    ]),
    registorUser
)

export default router
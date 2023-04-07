const roomServices = require('../../services/room/roomServices')
const validations = require('../../utils/validations/validations')
const uploadFile = require('../../utils/middlewares/aws')

const createRoom = async function(req,res){
    try {
        let data = req.body
        let {roomName,users,isPrivate} = data
        let files = req.files

        //=--=-=-=-=-=-=-roomName validation=-===-=-=-=-==-//
        if(!roomName) {
            return res.status(400).send({status:false,message: 'Room name is required'})
        }else{
            if(!validations.isValidName(roomName)) return res.status(400).send({status:false,message: 'invalid room name'})
            data.roomName = roomName.trim()
        }
        
        //=--=-=-=-=-=-=-users validation=-===-=-=-=-==-//
        if(users){
            let temp = users.split(",")
            data.users = []
            for(let i=0;i<temp.length;i++){
                if(!validations.isValidMongooseId(temp[i])) return res.status(400).send({status:false, message:"invalid user id"})
                data.users.push(temp[i])
            }
        }
        
        //=--=-=-=-=-=-=-isPrivate validation=-===-=-=-=-==-//
        if(isPrivate != "true" && isPrivate != "false"){
            return res.status(400).send({status:false, message:"invalid Isprivate input"})
        }

        //=-==-==-==-=-=- profile validation=-=-=-=-=--=-==//
        if(files && files.length > 0){
            let url = await uploadFile(files[0])
            data.profile = url
        }else{
            data.profile = "https://classroom-training-bucket.s3.ap-south-1.amazonaws.com/bookCover/no-profile-picture-6-1024x1024.jpg"
        }

        //=-===--=--=-=-== adding AdminID in data =-===-=-=-=--=-//
        data.roomAdmin = req.decode.userId

        //=--=-=-=-=-=-=- create room -=-=-=-=-=-==-//
        let finalData = await roomServices.createRoom(data)
    
        return res.status(201).send({status:true,message:finalData})
        
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
}

const addMember = async function(req,res){
    try {
        let data = req.body
        let {roomId,userId} = data
    
        //=--==-==-=-=- roomId validation =-=-==-=-// 
        if(!roomId) return res.status(400).send({status:false,message:"please enter roomId"})
        if(!validations.isValidMongooseId(roomId)) return res.status(400).send({status:false,message:"invalid room id"})
    
        //-=-=-=-=-=-=-userId validation =-=-=-=--=//
        if(!userId) return res.status(400).send({status:false,message:"please enter userId"})
        if(!validations.isValidMongooseId(userId)) return res.status(400).send({status:false,message:"invalid user id"})
    
        //=-=-=-=-check if user already addedin room=-=-=-//
        let check = roomServices.getRoom(roomId)
        if(!check) return res.status(400).send({status:false,message:"room not found"})    
    
        let usersArray = check.users
        if(usersArray.includes(userId)) return res.status(400).send({status:false,message:"user already added in room"})
    
        //=-=-=-=-==addition of user in room =-=-=--=-==-//
        let finalData = roomServices.updateRoom(roomId, userId)
        return res.status(200).send({status:true,message:finalData})

    } catch (error) {
        return res.status(500).send({status:false,message:error.message});
    }

}

module.exports = {createRoom,addMember}
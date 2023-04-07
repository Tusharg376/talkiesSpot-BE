const roomModel = require('../../models/roomModel')

module.exports.createRoom = async(data) =>{
    try{
        let result = await roomModel.create(data)
        return result
    }catch(err){
        throw err.message
    }
}

module.exports.getRoom = async function(data){
    try{
        let result = await roomModel.findOne({_id:data})
        return result
    }catch(err){
        throw err.message
    }
}

module.exports.updateRoom = async function(roomId,data){
    try{
        let result = await roomModel.findOneAndUpdate({_id:roomId},{$push:{users:data}} ,{new:true})
        return result
    }catch(err){
        throw err.message
    }
}
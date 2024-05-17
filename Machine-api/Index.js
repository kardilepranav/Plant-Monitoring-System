import express, { response } from 'express'; 
import mongoose from 'mongoose'
import { MachineDetails } from './Dbfile.js';
import cors from 'cors'
import { Admin } from './AdminModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

function verifyToken(request,response,next){
    const header = request.get('Authorization');
    if(header)
    {
        const token = header.split(" ")[1];
        jwt.verify(token,"secret1234",(error,payload)=>{
            if(error){
                response.send({message:"Invalid token"});
            }
            else
            {
                next();
            }
        });
    }else{
        response.send({message:"Please login first!"})
    }
    
}

const app=express();

app.use(cors())
app.use(express.json());

const connectDb = async()=>{
    try{
        await mongoose.connect('mongodb+srv://pranavkardile777:DSAjava%40c++@cluster0.uvqxurc.mongodb.net/plant',); 
        console.log("connected to database...!");
    } catch(error){
        console.log("Error db not connected");
    }
}
app.post("/admin",async(request,response)=>{
    try{
       const reqData = request.body;
       reqData['password'] = bcrypt.hashSync(reqData.password,10);
       const admin = new Admin(reqData);
        await admin.save();
        response.send({message :"Data Inserted"});
    }
    catch(error){
      response.send({message: "Oops! Something went wrong..."});
    }
});

app.post("/admin/login",async(request,response)=>{
    try{
        
      const admin = await Admin.findOne({phone:request.body.phone});
      if(admin){
        if(bcrypt.compareSync(request.body.password,admin.password)) 
        {
            const token=jwt.sign({adminPhone:admin.phone},"secret1234");
            response.send({message: "Login successful",token:token});
        }
        else{
            response.send({message: "Invalid Password"});
        }
      }
      else
      {
        response.send({message: "Invalid Phone"});
      }

    }
    catch(error){
      response.send({message: "Oops! Inavlid phone or password..."});
    }
});

app.post("/machine",async(request,response)=>{
    try{
        const reqData=request.body;
        const Details = new MachineDetails(reqData);
        await Details.save();
        response.send({message:'Details Inserted'})
    } catch(error){
        response.send({message:"Something went wrong..!"});
    }
})

app.get("/machine",async(request,response)=>{
    try{
        const Details = await MachineDetails.find();
        response.send({Details:Details});
    } catch(error){
        response.send({message:'Something went wrong..!'});
    }
})

app.get("/machine/:machno",async(request,response)=>{
    try{
        const Details = await MachineDetails.findOne({machno:request.params.machno});
        if(Details==null){
            response.send({message:"Details Not Found"});
        }
        else{
            response.send({Details:Details});
        }
    } catch(error){
        response.send({message:'Something went wrong'});
    }
})

app.delete("/machine/:machno",async(request,response)=>{
    try{
        await MachineDetails.deleteOne({machno:request.params.machno}); 
        response.send({message:'Student deleted'});
    } catch(error){
        response.send({message:'something went wrong...!'})
    }
})

app.put("/machine/:machno",async(request,response)=>{
    try{
        await MachineDetails.updateOne({machno:request.params.machno},request.body);
        response.send({message:"ok updated"})
    } catch(error){
        response.send('something went again wrong')
    }
})

app.get("/countyes/:working",async(request,response)=>{
    try{
        const count = await MachineDetails.countDocuments({
            working: { $in: ['yes', 'Yes'] }
        });
            response.json({ count });
    }catch(error){
        response.send('Something not found..!')
    }
})
app.get("/countno/:working",async(request,response)=>{
    try{
        const count = await MachineDetails.countDocuments({
            working: { $in: ['no', 'No'] }
        });
            response.json({ count });
    }catch(error){
        response.send('Something not found..!')
    }
})

app.get("/emergencycountyes/:emergenyrepair",async(request,response)=>{
    try{
        const count = await MachineDetails.countDocuments({
            emergenyrepair: { $in: ['yes', 'Yes'] }
        });
            response.json({ count });
    }catch(error){
        response.send('Something not found..!')
    }
})
app.get("/emergencycountno/:emergenyrepair",async(request,response)=>{
    try{
        const count = await MachineDetails.countDocuments({
            emergenyrepair: { $in: ['no', 'No'] }
        });
            response.json({ count });
    }catch(error){
        response.send('Something not found..!')
    }
})


app.get("/rates", (_req, res, _next) => {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
      Connection: "keep-alive", // allowing TCP connection to remain open for multiple HTTP requests/responses
      "Content-Type": "text/event-stream", // media type for Server Sent Events (SSE)
    });
    res.flushHeaders();
  
    const interval = setInterval(() => {
      const stock1Rate = Math.floor(Math.random() * 100000);
      const stock2Rate = Math.floor(Math.random() * 60000);
      res.write(`data: ${JSON.stringify({ stock1Rate, stock2Rate })}\n\n`);
    }, 2000);
  
    res.on("close", () => {
      clearInterval(interval);
      res.end();
    });
  });


app.listen(4900,()=>{
    console.log('Server is running on port 4900');
    connectDb();
});
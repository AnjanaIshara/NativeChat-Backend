const SocketServer = require('websocket').server
const http = require('http')
const translate = require('@vitalets/google-translate-api')//For the translation
const server = http.createServer((req, res) => {})

server.listen(3000, ()=>{
    console.log("Listening on port 3000...")
})

let wsServer = new SocketServer({httpServer:server})

const connections = []
const UserLang=[]

wsServer.on('request', (req) => {
    const connection = req.accept()
    
    console.log('new connection')
    connections.push(connection)
    
   
    connection.on('message', (mes) => {
        var data=mes.utf8Data.split('"')
        if(data[1]=="Language"){
            console.log(data[3])
            UserLang.push(data[3])
        }
        else{
            connections.forEach(function(element,index) {
            if (element != connection){
                
                if(data[5]=="message"){
                   
                    translate(data[7], {to: UserLang[index]}).then(res => {
                        console.log(res.text);
                        let temporyStore=data[7];
                        data[7]=data[7].concat('\n')
                        data[7]=data[7].concat(res.text)
                        
                        var s="";
                        for(var i in data){
                            s+=data[i]
                            s+='"'
                        }
                        console.log(s)
                         
                        data[7]=temporyStore;
                        element.sendUTF(s)
                        
                    }).catch(err => {
                        console.error(err);
                    });
                }
                else{
                    element.sendUTF(mes.utf8Data)//if the messsage is not a text message then it dosent get translated
                }
            }

        })
        }
       
        
    })

    connection.on('close', (resCode, des) => {
        UserLang.splice(connections.indexOf(connection),1)
        console.log('connection closed')
        connections.splice(connections.indexOf(connection), 1)
    })

})
var net = require('net');
var HOST = '127.0.0.1';
var PORT = 6969;

var pork = 10
var liver = 10
var kidney = 10
var intestine = 10
var softBoiledEgg = 10
var PreservedEgg = 10

var orderList = []
var order = ''
var amountSE
var amountPE
var amountPorridge
var lastText = ''

net.createServer(function (sock) {
    var state = 0 //idle
    sock.on('data', function (data) {
        switch(state){
            case 0:
                if(data.toString().toLowerCase() == 'hello'){
                    sock.write('Welcome to Kea-Nid pork porridge shop! \n'
                            + 'This is the list of food ingredients we have now. \n'
                            + 'Select main meat = "' + pork + '" Pork , nothing. \n'
                            + 'Ex. pork')

                    state = 1 //wait for meat select
                }
                else sock.write('first INVALID')
                break
            case 1:
                if(data.toString().toLowerCase() == 'pork' || data.toString().toLowerCase() == 'nothing'){
                    if(data.toString().toLowerCase() == 'pork' && pork <= 0){
                        sock.write('sorry now pork is out of stock please select orther')
                        break
                    }
                    order = data.toString().toLowerCase();
                    order += " porridge "
                    let liverQ = '"' + liver + '" liver, ' ;
                    let kidneyQ = '"' + kidney + '" kidney, ' ;
                    let intestineQ = '"' + intestine + '" intestine, ';
                    sock.write('Select offal = ' + liverQ + kidneyQ + intestineQ + 'nothing.\n'
                                + 'Ex. liver, kidney, intestine')

                    state = 2 //wait for offal select
                }
                else sock.write('main meat INVALID')
                console.log('1' +order)
                break
            case 2:
                let ans1 = data.toString().toLowerCase()
                let offalOutOfStock = false
                if(ans1.includes('liver') || ans1.includes('kidney') || ans1.includes('intestine') || ans1.includes('nothing')){
                    if(ans1.includes('liver') && liver <= 0){
                        sock.write('sorry now liver is out of stock please select orther')
                        offalOutOfStock = true
                    }
                    if(ans1.includes('kidney') && kidney <= 0){
                        sock.write('sorry now kidney is out of stock please select orther')
                        offalOutOfStock = true
                    }
                    if(ans1.includes('intestine') && intestine <= 0){
                        sock.write('sorry now intestine is out of stock please select orther')
                        offalOutOfStock = true
                    }
                    if(offalOutOfStock) break

                    data = data.toString().toLowerCase().replace(/\s/g, '').split(',')
                    if(!data.includes('nothing')){
                        for(let i in data){
                            let offal = data[i]
                            if(offal == 'liver' || offal == 'kidney' || offal == 'intestine'){
                                if(!order.includes('each with'))
                                    order += "each with "
                                order += offal
                                order += ', '
                            }
                        }
                    }
                    sock.write('More option = "' + softBoiledEgg + '" Soft-boiled egg, "' + PreservedEgg + '" Preserved egg or nothing.\n'
                            + 'Ex. soft-boiled egg = 1, preserved egg = 2')
                    state = 3 //wait for more option
                }
                else sock.write('offal INVALID')
                console.log('2' +order)
                break     
            case 3:
                try{
                    let ans2 = data.toString().toLowerCase()
                    let tmp = ''
                    let eggOutOfStock = false
                    if(ans2.includes('soft-boiled egg') || ans2.includes('preserved egg') || ans2.includes('nothing')){
                        data = data.toString().toLowerCase().split(',')
                        if(!data.includes('nothing')){
                            for(let i in data){
                                    let egg = data[i]
                                    egg = egg.split('=')
                                    if(egg[0].includes('soft-boiled')){
                                        amountSE = parseInt(egg[1] || 0)
                                        if(amountSE <= 0 || Number.isNaN(amountSE)){
                                            sock.write('amount soft-boiled egg invalid')
                                            eggOutOfStock = true
                                        }else if(amountSE > softBoiledEgg){
                                            sock.write('sorry now soft-boiled egg is out of stock please select orther')
                                            eggOutOfStock = true
                                        }
                                    }      
                                    else if(egg[0].includes('preserved egg')){
                                        amountPE = parseInt(egg[1] || 0)
                                        if(amountPE <= 0 || Number.isNaN(amountPE)){
                                            sock.write('amount preserved egg invalid')
                                            eggOutOfStock = true
                                        }else if(amountPE > PreservedEgg){
                                            sock.write('sorry now preserved egg is out of stock please select orther')
                                            eggOutOfStock = true
                                        }
                                    }
                                    console.log(eggOutOfStock)         
                                    if(eggOutOfStock) {
                                        tmp = ''
                                        break
                                    }
                                    if(!order.includes('each with'))
                                        order += "each with "
                                    tmp += egg[1]
                                    tmp += " "
                                    tmp += egg[0]
                                    tmp += ", "
                                    console.log(order)
                            }
                            order += tmp
                        }
                        if(eggOutOfStock) break
                        sock.write("SIZE = L or XL")
                        state = 4 //wait for size
                    }else sock.write('more option INVALID')
                }catch(e){
                    sock.write('more option INVALID')
                }

                console.log('3' +order)
                break
            case 4:
                data = data.toString().toUpperCase()
                if(data == "L" || data == "XL"){
                    let tmp = order
                    order = data
                    order += " "
                    order += tmp

                    sock.write("Amount minimum = 1")
                    state = 5 // wait for amount
                }
                else sock.write('size INVALID')
                console.log('4' +order)
                break
            case 5:
                try{
                    amountPorridge = parseInt(data || 0)
                    if(amountPorridge <=0 || Number.isNaN(amountPorridge)) {
                        console.log(Number.isNaN(amountPorridge))
                        sock.write('amount cannot be zero')
                        break
                    }
                    let tmp = order
                    order = amountPorridge + " "
                    order += tmp

                    sock.write("Confirm order (Yes or no)")
                    state = 6 //wait for confirm
                }catch(e){
                    sock.write('amount INVALID')
                }
                console.log('5' +order)
                break
            case 6:
                data = data.toString().toLowerCase()
                if(data == "yes"){
                    order = order.replace('nothing', '')
                    order = order.replace('undefined', '')
                    if(order.includes('pork')){
                        pork -= amountPorridge;
                    }
                    if(order.includes('liver')){
                        liver -= amountPorridge;
                    }
                    if(order.includes('kidney')){
                        kidney -= amountPorridge;
                    }
                    if(order.includes('intestine')){
                        intestine -= amountPorridge;
                    }
                    if(order.includes('soft-boiled')){
                        softBoiledEgg -= (amountSE*amountPorridge);
                    }
                    if(order.includes('preserved')){
                        PreservedEgg -= (amountPE*amountPorridge);
                    }
                    orderList.push(order)
                    sock.write("Do you want to order more food")
                    state = 7 //wait for new order
                }
                else if(data == "no"){
                    sock.write("Do you want to order more food")
                    state = 7 //wait for new order
                }
                else sock.write('confirm INVALID')
                console.log('6' +order)
                break
            case 7:
                data = data.toString().toLowerCase()
                if(data == "yes"){
                    sock.write('Select main meat = "' + pork + '"Pork or no')
                    state = 1
                }
                else if(data == "no"){
                    
                    orderList.forEach(function (od, i){
                        lastText += (i+1) + ') ' + od + '\n'
                    })
                    sock.write("All orders are \n"
                                +lastText)
                    sock.end()
                }
                else sock.write('new order INVALID')
                break
        }
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST + ':' + PORT);
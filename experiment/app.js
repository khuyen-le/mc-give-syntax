// --- LOADING MODULES
var express = require('express'),
    body_parser = require('body-parser');
    path = require('path');
    fs = require('fs');
    _ = require('lodash');

// --- INSTANTIATE THE APP
var app = express();
console.log(__dirname);

// --- STATIC MIDDLEWARE - SHARED
app.use('/jspsych/dist', express.static(path.join(__dirname, "/jspsych/dist")));
app.use('/lodash', express.static(path.join(__dirname, "/lodash")));

// --- STATIC MIDDLEWARE - SPECIFIC EXPERIMENTS
app.use(express.static(__dirname + '/give_semantic/public'));
app.use(express.static(__dirname + '/give_syntax/public'));
app.use(express.static(__dirname + '/NOUN2_norming/public'));

// --- BODY PARSING MIDDLEWARE
app.use(body_parser.json()); // to support JSON-encoded bodies

// --- VIEW LOCATION, SET UP SERVING STATIC HTML
app.set('views', [__dirname + '/give_semantic/public/views',
                  __dirname + '/give_syntax/public/views',
                  __dirname + '/NOUN2_norming/public/views']);
//TODO: currently this is set up such that this file (app.js) contains the route to all of the experiments.
// Ideally we should split up the routes for each expt to be in different files.
// router might be a good way to do it but problem with __dirname.
//app.set('views', [rootDir + '/viewsFolder1', rootDir + '/viewsFolder2']);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// --- ROUTING
app.get('/', function(request, response) {
    response.render('index.html');
});

app.get('/finish', function(request, response) {
    response.render('finish.html');
});

// ------------- GIVE SYNTAX ---------------- //
app.get('/MC-give-syntax', function(request, response) {
    const N_PPT = 100; // number of participants per 1 condition
    let conditions = _.shuffle(["MS-", "CT-"]);
    let stimuli_dir = [];
    fs.readdir("give_syntax/public/img", (err, files) => {
        if (err) {
            console.log("error"); 
            throw err;
        } else {
            console.log(files);
            stimuli_dir = files;
            fs.readdir("give_syntax/data", (err, files) => {
                if(err) {
                    console.log("error"); 
                    throw err;
                } 
                for (cond of conditions) {
                    console.log(cond);
                    let num_of_ppts = files.filter(function(file_name) {
                        return (file_name.includes(cond))
                    }).length;
                    console.log(num_of_ppts);
                    if (num_of_ppts < N_PPT) {
                        response.render('give-syntax.html', {condition: cond, stimuli_dir: stimuli_dir});
                        break;
                    } else {
                        continue;
                    }
                }
                //response.end();
                response.render('syntax-done-collecting.html');
            })
        }    
    })
});

app.get('/MC-give-syntax/finish', function(request, response) {
    response.render('syntax-finish.html');
});
app.get('/MC-give-syntax/return', function(request, response) {
    response.render('syntax-fail-check.html');
});

app.post('/MC-give-syntax/experiment-data', function(request, response){  
    console.log(request.body);
    var filename = "give_syntax/data/" + "MC_" + (request.body)["subject_id"] + ".json";
    var data = JSON.stringify((request.body)["data"]);
    fs.writeFile(filename, data, (err) => {
        if (err) {
            console.log("error");
            throw err;
        }
        console.log("successfully written to file");
    });
    response.end();
})

// ------------- GIVE SEMANTIC ---------------- //
app.get('/MC-give-sem', function(request, response) {
    const N_PPT = 1;
    let conditions = _.shuffle(["SNG-DIR", "MTP-DIR", "SNG-IMP", "MTP-IMP"]);
    fs.readdir("give_semantic/data", (err, files) => {
        if(err) {
            console.log("error"); 
            throw err;
        }
        for (cond of conditions) {
            console.log(cond);
            let num_of_ppts = files.filter(function(file_name) {
                return (file_name.includes(cond))
            }).length;
            if (num_of_ppts < N_PPT) {
                response.render('give-sem.html', {condition: cond})
                break;
            } else {
                continue;
            }
        }
        //console.log("all conditions have been fully collected");
        //TODO: file that says that this experiment is done collecting data. 
        response.end();
      });
});

app.post('/MC-give-sem/experiment-data', function(request, response){  
    console.log(request.body);
    var filename = "give_semantic/data/" + "MC_" + (request.body)["subject_id"] + ".json";
    var data = JSON.stringify((request.body)["data"]);
    fs.writeFile(filename, data, (err) => {
        if (err) {
            console.log("error");
            throw err;
        }
        console.log("successfully written to file");
    });
    response.end();
})

// ------------- NOUN NORMING ---------------- //
app.get('/MC-NOUNstim-norming', function(request, response) {
    const N_PPT = 1;
    console.log(request.query);
    var send_data = {
        stimuli: null, 
        ver: request.query.ver, 
        id: request.query.id,
    }
    fs.readdir("NOUN2_norming/public/img", (err, files) => {
        if(err){
            console.log("error");
            throw err;
        }
        if (files.length < N_PPT) {
            send_data.stimuli = files;
            console.log(send_data);
            response.render('noun2-stim-norm.html', send_data);
        } else {
            response.end();
            console.log("all experiments have been collected");
            // TODO: SHOW A SCREEN THAT SAYS TO CONTACT THE EXPERIMENTER
        }
    })
});


app.post('/MC-NOUNstim-norming/experiment-data', function(request, response){  
    console.log(request.body);
    var filename = "NOUN2_norming/data/" + "MC_" + (request.body)["subject_id"] + ".json";
    var data = JSON.stringify((request.body)["data"]);
    fs.writeFile(filename, data, (err) => {
        if (err) {
            console.log("error");
            throw err;
        }
        console.log("successfully written to file");
    });
    response.end();
})




// --- START THE SERVER 
var server = app.listen(process.env.PORT || 3023, function(){
    console.log("Listening on port %d", server.address().port);
});

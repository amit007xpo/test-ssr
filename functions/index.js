
const functions = require("firebase-functions");
//const admin = require("firebase-admin");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var {db} = require('./config/services/firebase');

app.set('views', __dirname + '/view');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

app.use('/public',express.static(__dirname+'/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// exports.app =functions.https.onRequest(app);

exports.deleteVideos = functions.firestore.document(`/users/{userId}/videos/{videoId}`).onDelete((snapshot, context) => {
	  const data = snapshot.data();
		console.log(data);
		const bucket = firebase.storage().bucket();
		if(data.videoId){
			bucket.file(`videos/${data.videoId}`).delete().then((success) => {
				deleteOutputFile();
			}).catch((err) => {
				deleteOutputFile();
			});
		}
		function deleteOutputFile() {
			if(data.outputVideoId){
				bucket.file(`videos/output/${data.outputVideoId}`).delete().then((success) => {
				return;
				}).catch((err) => {
					return;				
				});

			}
    }
})

app.get('/', function (req, res) {
    res.render(__dirname+ '/view/components/LandingPage/index', { name: 'John' });
  });
  app.get('/ping', function (req, res) {
    res.send('hello');
  });

  app.get('/:userId/videos/:videoId', function (req, res) {
      // console.log(req.params)
    db.collection("users")
    .doc(req.params.userId)
    .collection("videos")
    .doc(req.params.videoId).onSnapshot(function(snapshot) {
        res.render(__dirname+ '/view/components/SingleVideoShare/index', { video: snapshot.data(), fullUrl: (req.protocol + '://' + req.get('host') + req.originalUrl), status: true });
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        res.render(__dirname+ '/view/components/SingleVideoShare/index', { video: {}, status: false, fullUrl: (req.protocol + '://' + req.get('host') + req.originalUrl) });
      });
  });

 app.get('/download/:videoId', function (req, res) {
     var url1= "https://firebasestorage.googleapis.com/v0/b/recordingmechanic.appspot.com/o/videos%2F2d7669e6-4f41-0321-b09f-c8b2d76ebd81?alt=media&token=0dace58d-acee-479f-a405-d4e67c2f9c0f";
    var config = {
        headers: {'Access-Control-Allow-Origin': '*'}
      };
        axios({
          url: url1,
          method: 'GET',
          responseType: 'blob', // important
          config
        }).then(response=>{
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = global.document.createElement('a');
        //   link.href = url;
        //   link.setAttribute('download', this.props.outputVideoId);
        //   document.body.appendChild(link);
        //   link.click();
        res.download(url);
      }).catch(err=> {
        console.log(err);
      });
    
 })




app.listen(7080, function () {
    console.log('Example app listening on port 7080 !');
});

exports.app = functions.https.onRequest(app);
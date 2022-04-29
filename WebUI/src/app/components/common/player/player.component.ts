import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { event } from 'jquery';
import { forkJoin, Subscription } from 'rxjs';
import { ModalDialogComponent } from '../../../shared/modal-dialog/modal-dialog.component';
import { StateAdto, VideoFilesSubscriptionAdto } from '../../../interfaces/adto';
import { FeedManager } from '../../../models/feed/feed-manager';
import { MediaGroupManagerService } from '../../../models/feed/media-group-manager';
import { AuthService } from '../../../services/auth/auth.service';
import { PlayerService } from '../../../services/player/player.service';
import { RecordingService } from '../../../services/player/recording.service';
import { ApiUrls } from '../../../util/api-urls';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnDestroy, OnInit {
  @Input()
  set popupParam(value: { id?: number }) {
    if (value) {
      this.id = value.id;
    }
  };

  @ViewChild("videoPlayer", { static: false }) videoplayer: ElementRef;
  showProgress: boolean;
  id: number;
  mouseOver: boolean = false
  offset = "61";
  public feed: FeedManager;
  public apiUrls :ApiUrls;
  public state : StateAdto;
  msg : string;
  url:string;
  videoModel = [];
  videoPlayModel : any;
  public thumbUri : any;
  thumbnail : string;
  playingVideo:boolean = false;
  videoSource='';
  play_pause : any;
  progressAreaTime : any;
  controls : any;
  progressArea: any;
  progress_Bar: any;
  fast_rewind: any;
  fast_forward: any;
  volume: any;
  volume_range: any;
  current: any;
  totalDuration: any;
  auto_play: any;
  settingsBtn: any;
  picture_in_picutre: any;
  fullscreen: any;
  settings: any;
  playback: any;
  isPlaying = true;
  initialViewCheck = false;
  currentPlayback: any;
  playbackRates = [
    { id: 0, name: '0.25', value: '0.25' },
    { id: 1, name: '0.5', value: '0.5' },
    { id: 2, name: '0.75', value: '0.75' },
    { id: 3, name: 'Normal', value: '1' },
    { id: 4, name: '1.25', value: '1.25' },
    { id: 5, name: '1.75', value: '1.75' },
    { id: 6, name: '2', value: '2' }]
  currentTime: number;
  baseUrl: string;
  mediaRequestId = 1;
  baseAudioUrl: string;
  isReachEnd: boolean = false;
  isTrue: boolean = false;
  displayVTT: boolean;
  mediaVtt = [];
  displayVTTText:string;
  private subscription?: Subscription;

  constructor(private recordingService : RecordingService, private groupManagerService: MediaGroupManagerService, private http : HttpClient,private authService: AuthService,private playerService: PlayerService,private modalComp: ModalDialogComponent) { 
    this.feed = new FeedManager(this.apiUrls,this.groupManagerService,this.state,this.http);
    this.apiUrls = new ApiUrls();
  }


  ngOnInit(): void {
    this.play_pause = document.querySelector('.play_pause');
    this.progressAreaTime = document.querySelector('.progressAreaTime');
    this.controls = document.querySelector('.controls');
    this.progressArea = document.querySelector('.progress-area');
    this.progress_Bar = document.querySelector('.progress-bar');
    this.fast_rewind = document.querySelector('.fast-rewind');
    this.fast_forward = document.querySelector('.fast-forward');
    this.volume = document.querySelector('.volume');
    this.volume_range = document.querySelector('.volume_range');
    this.current = document.querySelector('.current');
    this.totalDuration = document.querySelector('.duration');
    this.auto_play = document.querySelector('.auto-play');
    this.settingsBtn = document.querySelector('.settingsBtn');
    this.picture_in_picutre = document.querySelector('.picture_in_picutre');
    this.fullscreen = document.querySelector('.fullscreen');
    this.settings = document.querySelector('#settings');
    this.playback = document.querySelectorAll('.playback li');
    this.displayPlayer();
  }

  updateUrl() {
    var url = new URL(this.videoplayer.nativeElement.currentSrc);
    var search_params = url.searchParams;
    search_params.set('start', Number(this.convertMinToSecs(this.progressAreaTime.innerText)).toString());
    url.search = search_params.toString();
    var new_url = url.pathname + url.search;
    this.videoSource = new_url;
  }

  /* Custom plyer function */
  // Play video function
  playVideoSrc() {
    this.play_pause.innerHTML = "pause";
    this.videoplayer.nativeElement.classList.add('paused')
    this.videoplayer.nativeElement.play();
    if (this.currentTime === 0 && this.isReachEnd) {
      this.isReachEnd = false;
      this.playVideo();
    }
  }


  setCurrentTime(data) {
    this.currentTime = data.target.currentTime;
    this.checkVttContent(this.currentTime);
    if (this.currentTime >= 9 && this.currentTime < 20) {
      this.displayVTT = true;
    }
    else {
      this.displayVTT = false;
    }

    this.updateProgressBarTime(event);
  }

  checkVttContent(currentTime) {
    if (this.mediaVtt.length > 0) {
      for (let key in this.mediaVtt) {
        let value = this.mediaVtt[key].keyFrames;
        if (currentTime >= value[0].time && currentTime < value[1].time) {
          this.displayVTT = true;
          this.displayVTTText = this.mediaVtt[key].text;
        }
        else {
          //this.displayVTT = false;
        }
        console.log(value);
      }
    }

  }

  // Pause video function
   pauseVideo() {
    this.play_pause.innerHTML = "play_arrow";
   this.videoplayer.nativeElement.classList.remove('paused')
   this.videoplayer.nativeElement.pause();
  }

  playPause() {
    const isVideoPaused = this.videoplayer.nativeElement.classList.contains('paused');
    (isVideoPaused && this.isPlaying)? this.pauseVideo() : this.playVideoSrc();
  }

  skip(value) {
    var video = document.getElementById("main-video") as HTMLVideoElement;
    video.currentTime += value;
  }      
  
  fastRewind(){
    this.videoplayer.nativeElement.currentTime =-2;
  }

  fastForward() {
    this.videoplayer.nativeElement.currentTime = +2;
  }

  loadedDataTotalDuration(val) {
    let videoDuration = val;
    let totalMin : any = Math.floor(videoDuration / 60);
    let totalSec : any = Math.floor(videoDuration % 60);
  
    // if seconds are less then 10 then add 0 at the begning
    totalSec < 10 ? totalSec = "0" + totalSec : totalSec;
    this.totalDuration.innerHTML = `${totalMin} : ${totalSec}`;
  }

  updateProgressBarTime(event) {
    let currentVideoTime = this.currentTime;
    let currentMin: any = Math.floor(currentVideoTime / 60);
    let currentSec: any = Math.floor(currentVideoTime % 60);
    // if seconds are less then 10 then add 0 at the begning
    currentSec < 10 ? currentSec = "0" + currentSec : currentSec;
    this.current.innerHTML = `${currentMin} : ${currentSec}`;

    let videoDuration = this.videoplayer?.nativeElement.duration
    if (this.currentTime >= videoDuration) {
      this.currentTime = 0;
      this.isReachEnd = true;
      this.pauseVideo();
    }
    // progressBar width change
    let progressWidth = (currentVideoTime / videoDuration) * 100;
    this.progress_Bar.style.width = `${progressWidth}%`;
  }

  updateProgressBarTimeNew(event) {
    this.playPause();
    let currentVideoTime = Number(this.convertMinToSecs(this.progressAreaTime.innerText));
    let currentMin: any = Math.floor(currentVideoTime / 60);
    let currentSec: any = Math.floor(currentVideoTime % 60);
    // if seconds are less then 10 then add 0 at the begning
    currentSec < 10 ? currentSec = "0" + currentSec : currentSec;
    this.current.innerHTML = `${currentMin} : ${currentSec}`;

    let videoDuration = this.videoplayer?.nativeElement.duration
    if (this.currentTime >= videoDuration) {
      this.currentTime = 0;
      this.isReachEnd = true;
      this.pauseVideo();
    }
    // progressBar width change
    let progressWidth = (currentVideoTime / videoDuration) * 100;
    this.progress_Bar.style.width = `${progressWidth}%`;
    console.log('Clicked progress bar..!!!');
    this.videoplayer.nativeElement.currentTime = currentVideoTime;
  }

  updateProgressArea(e) {
    forkJoin([
      this.getJpegJson(), //observable 1
      this.getAudioJson() //observable 2
    ]).subscribe(([jpegData, audioResData]) => {
      console.log('JPEG' + jpegData);
      console.log('Audio' + jpegData);
      // When Both are done loading do something
    });
    this.updateProgressBarTimeNew(event);
  }

  updateRequestId() {
    return this.mediaRequestId++;
  }
  convertMinToSecs(input) {
    var parts = input.split(':'),
      minutes = +parts[0],
      seconds = +parts[1];
    return (minutes * 60 + seconds).toFixed(3);
  }

  convertUrlToJpgeJson() {
    this.currentTime = Number(this.convertMinToSecs(this.progressAreaTime.innerText));
    this.baseUrl = this.videoplayer.nativeElement.currentSrc.replace('fmp4', 'jpegjson');
    var url = new URL(this.baseUrl);
    var search_params = url.searchParams;
    // new value of "id" is set to "101"
    search_params.set('start', this.currentTime.toString());
    search_params.set('duration', '0.001');
    search_params.set('qdiv', '1');
    // change the search property of the main url
    url.search = search_params.toString();
    // the new url string
    var new_url = url.pathname + url.search;
    return new_url;
  }

  convertUrlToAudio() {
    this.baseAudioUrl = this.videoplayer.nativeElement.currentSrc.replace('fmp4', 'audio');
    var url = new URL(this.baseAudioUrl);
    var search_params = url.searchParams;
    // new value of "id" is set to "101"
    search_params.set('start', this.currentTime.toString());
    search_params.set('duration', '0.2');
    search_params.delete('suspend');
    search_params.delete('maxDimension');
    // change the search property of the main url
    url.search = search_params.toString();
    // the new url string
    var new_url = url.pathname + url.search;
    return new_url;
  }
  
   /**
     * Get current User from the server.
     *
     * @returns {json} current user.
     */
    public getJpegJson(): any {
      const jpegUrl = this.convertUrlToJpgeJson();
      const reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'No-Auth': 'True' });
     this.http.get(jpegUrl,{ headers: reqHeader }).subscribe(json => console.log("Jpeg Response"+json));
    }
  
    public getAudioJson(): any {
      const audioUrl = this.convertUrlToAudio();
      const reqHeader = new HttpHeaders({ 'Content-Type': 'application/json', 'No-Auth': 'True' });
     this.http.get(audioUrl,{ headers: reqHeader }).subscribe(json => console.log("Audio Response"+json));
    }
  
  changeVolume(){
    this.videoplayer.nativeElement.volume = this.volume_range.value / 100;
    if (this.volume_range.value == 0) {
      this.volume.innerHTML = "volume_off";
    } else if (this.volume_range.value < 40) {
      this.volume.innerHTML = "volume_down";
    } else {
      this.volume.innerHTML = "volume_up";
    }
  }

  muteVolume() {
    if (this.volume_range.value == 0) {
      this.volume_range.value = 80;
      this.videoplayer.nativeElement.volume = 0.8;
      this.volume.innerHTML = "volume_up";
    } else {
      this.volume_range.value = 0;
      this.videoplayer.nativeElement.volume = 0;
      this.volume.innerHTML = "volume_off";
    }
  }

  updateProgressAreaTimeOnMouseMove(e) {
    let progressWidthval = this.progressArea.clientWidth;
    let x = e.offsetX;
    this.progressAreaTime.style.setProperty('--x', `${x}px`);
    this.progressAreaTime.style.display = "block";
    let videoDuration = this.videoplayer.nativeElement.duration;
    let progressTime = Math.floor((x / progressWidthval) * videoDuration);
    let currentMin: any = Math.floor(progressTime / 60);
    let currentSec: any = Math.floor(progressTime % 60);
    // if seconds are less then 10 then add 0 at the begning
    currentSec < 10 ? currentSec = "0" + currentSec : currentSec;
    this.progressAreaTime.innerHTML = `${currentMin} : ${currentSec}`;
  }

  updateProgressAreaTimeOnMouseLeave() {
    this.progressAreaTime.style.display = "none";
  }

  pictureInPicture() {
    this.videoplayer.nativeElement.requestPictureInPicture();
  }

  fullScreen() {
    if (!this.videoplayer.nativeElement.classList.contains('openFullScreen')) {
      this.videoplayer.nativeElement.classList.add('openFullScreen');
      this.fullscreen.innerHTML = "fullscreen_exit";
      this.videoplayer.nativeElement.requestFullscreen();
    } else {
      this.videoplayer.nativeElement.classList.remove('openFullScreen');
      this.fullscreen.innerHTML = "fullscreen";
      this.videoplayer.nativeElement.exitFullscreen();
    }
  }

  onClickSettingBtn() {
    this.settings.classList.toggle('active');
    this.settingsBtn.classList.toggle('active');
  }

  // Playback Rate
  onClickPlayback(selected) {
    this.changePlaybackState(selected);
    this.videoplayer.nativeElement.playbackRate = selected;
  }

  changePlaybackState(selected: any) {
    this.currentPlayback = selected;
  }
  
    showView(){
      if (this.id) {
        // let url = this.appUrls.videoInfo(this.id, this.offset);
         let videoRecUrl = 'api/videos/'+this.id+'/recording';
   
         this.recordingService.getRecordings(videoRecUrl).subscribe(result => {
           console.log(result);
        })
     }
    }
  
    private createGroupId() : string {
      return '' + Math.floor(Math.random() * 100000000 );
    }
  
    displayPlayer(){
    this.subscription = this.playerService.data$.subscribe(res =>{
      this.videoModel.push(res);
    });
       this.fetchMediaPreparations();
       this.playVideo();
    }
  
   fetchMediaPreparations() {
      this.mediaVtt =[];
      let preparationConfig = {url:''};
      preparationConfig.url = this.apiUrls.videoPreparations(Number(this.id));
      this.http.get(preparationConfig.url).subscribe((res: any) =>{
        console.log(res);
        if (res !== undefined && res !== null && res.length > 0) {
          this.mediaVtt = [...res[0].annotationConfig.annotations];
        }
      });
    }
  
    playVideo(){
      let playUrl = 'api/videos/'+this.id+'/original/play';
      let data = { mgroupid : this.createGroupId() };
      this.playerService.getPlayableDetails(playUrl,data).subscribe((res) =>{
        console.log(res);
        this.videoPlayModel = res;
        this.loadedDataTotalDuration(this.videoPlayModel.duration)
       // this.playingVideo = true;
        this.videoSource = this.videoPlayModel.mediaUri+'/fmp4?msessid='+this.createGroupId()+'&quality=1&start='+(this.currentTime ? this.currentTime : 0)+'&duration=full&requestId='+this.updateRequestId()+'&suspend=true&maxDimension=621'       
     });
    }

    over() {
      this.mouseOver = true
    }
    out() {
      this.mouseOver = false;
    }
    
    downloadFile() {
      this.url = 'api/videos/' + this.id + '/file'
  
      this.playerService.downloadVideo('api/videos/' + this.id + '/file').subscribe((res) => {
        var vidFile = new Blob([res], { type: 'application/octet-stream;' });
        var vidURL = window.URL.createObjectURL(vidFile);
        console.log(vidURL)
        var tempLink = document.createElement('a');
        tempLink.href = vidURL;
        tempLink.setAttribute('download', `${this.modalComp.title}.mp4`);
        tempLink.click();
        this.showProgress = false;
        URL.revokeObjectURL(vidURL);
      })
  
  
    }
    ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
}


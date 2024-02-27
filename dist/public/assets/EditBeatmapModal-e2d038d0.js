import{d as f,B as O,Z as S,_,b as h,o as a,e as o,k as r,q as g,M as U,a as e,t as m,i as $,j as b,c as B,n as y,p as c,y as I,v as T,F as L,r as P,m as C,f as F,g as G,W as A,s as z,u as K,w as Q}from"./index-970ccb5e.js";import{a as M,T as X,S as Z}from"./task-21eeb954.js";import{T as J}from"./TasksChoice-caab8687.js";import{U as j}from"./UserLinkList-5767dfe1.js";import{M as Y}from"./ModalDialog-390e660e.js";function q(s,t,n){const l={class:["px-1","text-"+t.toLowerCase()]};return n&&(l["data-bs-toggle"]="tooltip",l["data-bs-placement"]="top",l.title=n),S("span",l,s)}const x=f({props:{tasks:{type:Array,required:!0},tasksLocked:{type:Array,required:!0},mode:{type:String,required:!0}},render(){const s=[{name:"Easy",short:"E",locked:!1,status:[]},{name:"Normal",short:"N",locked:!1,status:[]},{name:"Hard",short:"H",locked:!1,status:[]},{name:"Insane",short:"I",locked:!1,status:[]},{name:"Expert",short:"X",locked:!1,status:[]}],t=[{name:"osu",short:"circle",count:0,status:M.Done},{name:"taiko",short:"drum",count:0,status:M.Done},{name:"catch",short:"apple-alt",count:0,status:M.Done},{name:"mania",short:"stream",count:0,status:M.Done}],n=[],l=this.tasks.length>=10,k=this.mode===O.Hybrid;for(const u of s){let d=!1;const i=this.tasksLocked.includes(u.name);for(const p of this.tasks)if(u.name===p.name){u.status.push(p.status),d=!0;const v=t.findIndex(w=>w.name===p.mode);v!==-1&&(t[v].count++,p.status===M.WIP&&(t[v].status=M.WIP))}if(!k){if(l&&u.status.length>1)n.push(q(u.short+"+","secondary",u.status.length.toString()));else for(const p of u.status)n.push(q(u.short,p));d||n.push(q(u.short,i?"blocked":"open"))}}if(k)for(const u of t)n.push(q([S("i",{class:["fas","fa-"+u.short]})],u.count?u.status:"blocked",u.count.toString()));return S("span",{class:"fw-bold"},n)}}),ss=f({props:{beatmap:{type:Object,required:!0}},computed:{url(){var s;if(this.beatmap.mission)switch(this.beatmap.mission.tier){case 1:return"/images/dark-bronze.png";case 2:return"/images/dark-silver.png";case 3:return"/images/dark-gold.png";case 4:return"/images/dark-platinum.png";default:return"/images/dark-bronze.png"}return this.beatmap.isShowcase||!((s=this.beatmap.quest)!=null&&s.art)?"/images/no-art-icon.png":this.beatmap.quest.isMbc?"/images/mbc-icon.png":`https://assets.ppy.sh/artists/${this.beatmap.quest.art}/cover.jpg`}}});const ts=["src"];function es(s,t,n,l,k,u){const d=g("bs-tooltip");return s.beatmap.quest||s.beatmap.mission||s.beatmap.isShowcase?h((a(),o("img",{key:s.$route.query.id,class:"rounded-circle me-1 quest-icon",src:s.url},null,8,ts)),[[d,s.beatmap.quest&&s.beatmap.quest.name||s.beatmap.mission&&s.beatmap.mission.name||"FA showcase"]]):r("",!0)}const D=_(ss,[["render",es],["__scopeId","data-v-c16b6cea"]]),as=f({name:"BeatmapCard",components:{ProcessTasks:x,QuestImg:D,ModesIcons:U},props:{beatmap:{type:Object,required:!0}},emits:["update:selectedBeatmap"],data(){return{defaultUrl:"https://osu.ppy.sh/images/layout/beatmaps/default-bg.png"}},computed:{statusBorder(){return this.beatmap.status?"card-status-"+this.beatmap.status.toLowerCase():""}},methods:{fallbackImage(s){s.target.src=this.defaultUrl},formatMetadata(s,t){return s+" - "+t},processUrl(s){if(s&&s.indexOf("osu.ppy.sh/beatmapsets/")!==-1){const t=s.indexOf("beatmapsets/")+12,n=s.indexOf("#");let l;return n!==-1?l=s.slice(t,n):l=s.slice(t),`https://assets.ppy.sh/beatmaps/${l}/covers/card.jpg`}else return this.defaultUrl}}});const os=["src"],is={class:"card-img-overlay",style:{padding:"0.50rem 0.50rem 0 0.50rem"}},ns={class:"card-title mb-1 text-truncate"},ds={class:"card-text"};function rs(s,t,n,l,k,u){const d=c("quest-img"),i=c("user-link"),p=c("modes-icons"),v=c("process-tasks");return a(),o("div",{class:"my-2 col-sm-12 col-md-6 col-lg-4",onClick:t[1]||(t[1]=w=>s.$emit("update:selectedBeatmap",s.beatmap))},[e("div",{class:y(["card card-hover map-card bg-dark",s.statusBorder]),"data-bs-toggle":"modal","data-bs-target":"#editBeatmap"},[e("img",{class:"card-img",src:s.processUrl(s.beatmap.url),style:{opacity:"0.2"},onError:t[0]||(t[0]=w=>s.fallbackImage(w))},null,40,os),e("div",is,[e("p",ns,m(s.formatMetadata(s.beatmap.song.artist,s.beatmap.song.title)),1),e("small",ds,[$(d,{beatmap:s.beatmap},null,8,["beatmap"]),b(" Hosted by "),$(i,{class:"me-1",user:s.beatmap.host},null,8,["user"]),s.beatmap.mode!=="osu"?(a(),B(p,{key:0,modes:[s.beatmap.mode]},null,8,["modes"])):r("",!0),$(v,{class:"float-end pt-1",tasks:s.beatmap.tasks,"tasks-locked":s.beatmap.tasksLocked,mode:s.beatmap.mode},null,8,["tasks","tasks-locked","mode"])])])],2)])}const He=_(as,[["render",rs],["__scopeId","data-v-87c36204"]]),ls=f({name:"ModeChoice",props:{beatmap:{type:Object,required:!0}},data(){return{selectedMode:this.beatmap.mode,showInput:!1,modes:[{value:"osu",name:"osu!"},{value:"taiko",name:"osu!taiko"},{value:"catch",name:"osu!catch"},{value:"mania",name:"osu!mania"},{value:"hybrid",name:"Multiple modes"}]}},methods:{async setMode(s){const t=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/setMode`,{mode:this.selectedMode},s);this.$http.isError(t)||this.$store.dispatch("beatmaps/updateBeatmap",t),this.showInput=!1}}}),ps={id:"mode"},us={class:"row mb-2"},ms={class:"col"},cs=e("i",{class:"fas fa-edit"},null,-1),hs=[cs],bs={class:"small ms-3 text-secondary"},ks={key:0,class:"row mb-2"},$s={class:"col"},fs={class:"input-group input-group-sm"},_s=["value"];function ys(s,t,n,l,k,u){const d=g("bs-tooltip");return a(),o("div",ps,[e("div",us,[e("div",ms,[e("div",null,[b(" Mode "),h((a(),o("a",{id:"editMode",href:"#",class:y([s.showInput?"text-danger":"","text-success small ms-1"]),onClick:t[0]||(t[0]=I(i=>s.showInput=!s.showInput,["prevent"]))},hs,2)),[[d,"edit mode","right"]])]),e("div",bs,m(s.beatmap.mode=="hybrid"?"Multiple modes":s.beatmap.mode=="osu"?"osu!":"osu!"+s.beatmap.mode),1)])]),s.showInput?(a(),o("div",ks,[e("div",$s,[e("div",fs,[h(e("select",{"onUpdate:modelValue":t[1]||(t[1]=i=>s.selectedMode=i),class:"form-select"},[(a(!0),o(L,null,P(s.modes,i=>(a(),o("option",{key:i.value,value:i.value},m(i.name),9,_s))),128))],512),[[T,s.selectedMode]]),h((a(),o("button",{class:"btn btn-outline-info",onClick:t[2]||(t[2]=i=>s.setMode(i))},[b(" Save ")])),[[d,"link beatmap to quest"]])])])])):r("",!0)])}const vs=_(ls,[["render",ys]]),gs=f({name:"StatusChoice",props:{beatmap:{type:Object,required:!0}},methods:{async setStatus(s,t){const n=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/setStatus`,{status:s},t);this.$http.isError(n)||this.$store.dispatch("beatmaps/updateBeatmap",n)}}}),ws={id:"mapsetStatus"},Is=e("div",{class:"d-inline-block me-2"}," Status ",-1),Bs=["disabled"],Ls=["disabled"],Ps={class:"small text-secondary"},Ms=e("div",{class:"small text-secondary mt-1"},[e("div",{class:"small"},' Maps marked as "Done" will be processed for points when they reach the Ranked category on osu!. ')],-1);function qs(s,t,n,l,k,u){const d=g("bs-tooltip");return a(),o("div",ws,[Is,h((a(),o("button",{class:y(["btn btn-sm me-1",s.beatmap.status=="WIP"?"btn-warning":"btn-outline-warning"]),disabled:s.beatmap.status=="WIP",onClick:t[0]||(t[0]=i=>s.setStatus("WIP",i))},[b(" WIP ")],10,Bs)),[[d,"mark mapset as work-in-progress","bottom"]]),h((a(),o("button",{class:y(["btn btn-sm me-1",s.beatmap.status=="Done"?"btn-success":"btn-outline-success"]),disabled:s.beatmap.status=="Done",onClick:t[1]||(t[1]=i=>s.setStatus("Done",i))},[b(" Done ")],10,Ls)),[[d,"mark mapset and all diffs as done","bottom"]]),e("span",Ps,'(currently "'+m(s.beatmap.status)+'")',1),Ms])}const Cs=_(gs,[["render",qs]]),Ss=f({name:"QuestOrMissionChoice",props:{beatmap:{type:Object,required:!0}},data(){return{userQuests:[],openMissions:[],showInput:!1,dropdownId:""}},computed:C(["loggedInUser"]),watch:{async beatmap(){var t,n;this.showInput=!1,this.dropdownId=((t=this.beatmap.quest)==null?void 0:t.id)||((n=this.beatmap.mission)==null?void 0:n.id)||"";const s=await this.$http.executeGet(`/missions/open/${this.beatmap.mode}/${this.beatmap.id}`);this.$http.isError(s)||(this.openMissions=s)}},async created(){const s=await this.$http.executeGet(`/users/${this.loggedInUser.id}/quests`),t=await this.$http.executeGet(`/missions/open/${this.beatmap.mode}/${this.beatmap.id}`);this.$http.isError(s)||(this.userQuests=s),this.$http.isError(t)||(this.openMissions=t)},methods:{async linkQuestOrMission(s){const t=this.userQuests.find(l=>l.id==this.dropdownId),n=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/${t?"linkQuest":"linkMission"}`,{questOrMissionId:this.dropdownId},s);this.$http.isError(n)||this.$store.dispatch("beatmaps/updateBeatmap",n)}}}),Ts={class:"row mb-2"},Es={class:"col"},As=e("i",{class:"fas fa-edit"},null,-1),Qs=[As],Os={class:"small ms-3 text-secondary"},Us=["href"],js=["href"],Ds={key:2},Ns={key:0,class:"row mb-2"},Hs={class:"col"},Rs={class:"input-group input-group-sm"},Ws=e("option",{value:""}," No quest ",-1),Vs={key:0,disabled:""},Fs=["value"],Gs={key:1,disabled:""},zs=["value"];function Ks(s,t,n,l,k,u){const d=g("bs-tooltip");return a(),o("div",null,[e("div",Ts,[e("div",Es,[e("div",null,[b(" Quest "),h((a(),o("a",{id:"editLink",href:"#",class:y([s.showInput?"text-danger":"","text-success small ms-1"]),onClick:t[0]||(t[0]=I(i=>s.showInput=!s.showInput,["prevent"]))},Qs,2)),[[d,"connect mapset with a quest","right"]])]),e("div",Os,[s.beatmap.quest?(a(),o("a",{key:0,href:`/quests?id=${s.beatmap.quest.id}`},m(s.beatmap.quest.name),9,Us)):s.beatmap.mission?(a(),o("a",{key:1,href:`/missions?id=${s.beatmap.mission.id}`},m(s.beatmap.mission.name),9,js)):(a(),o("i",Ds,"none"))])])]),s.showInput?(a(),o("div",Ns,[e("div",Hs,[e("div",Rs,[h(e("select",{"onUpdate:modelValue":t[1]||(t[1]=i=>s.dropdownId=i),class:"form-select"},[Ws,s.userQuests.length?(a(),o("option",Vs," --- claimed quests --- ")):r("",!0),(a(!0),o(L,null,P(s.userQuests,i=>(a(),o("option",{key:i.id,value:i.id},m(i.name),9,Fs))),128)),s.openMissions.length?(a(),o("option",Gs," --- open priority quests --- ")):r("",!0),(a(!0),o(L,null,P(s.openMissions,i=>(a(),o("option",{key:i.id,value:i.id},m(i.name),9,zs))),128))],512),[[T,s.dropdownId]]),h((a(),o("button",{class:"btn btn-outline-info",onClick:t[2]||(t[2]=i=>s.linkQuestOrMission(i))},[b(" Save ")])),[[d,"link beatmap to quest"]])])])])):r("",!0)])}const Xs=_(Ss,[["render",Ks]]),Zs=f({name:"ModdersList",components:{UserLinkList:j},props:{canEdit:Boolean,beatmap:{type:Object,required:!0}},computed:{...C(["loggedInUser"]),isModder(){return this.beatmap.modders.some(s=>s.osuId==this.loggedInUser.osuId)}},methods:{async updateModder(s){s.target.classList.add("fake-button-disable");const t=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/updateModder`);this.$http.isError(t)||this.$store.dispatch("beatmaps/updateBeatmap",t),s.target.classList.remove("fake-button-disable")}}}),Js={id:"modders",class:"row mb-2"},Ys={class:"col"},xs={key:0,class:"ms-1"},st={class:"small ms-3"},tt={key:0,class:"text-secondary"};function et(s,t,n,l,k,u){const d=c("user-link-list"),i=g("bs-tooltip");return a(),o("div",Js,[e("div",Ys,[e("div",null,[b(" Modders ("+m(s.beatmap.modders.length)+") ",1),s.canEdit?h((a(),o("small",xs,[e("a",{href:"#",class:y(s.isModder?"text-danger":"text-success"),onClick:t[0]||(t[0]=I(p=>s.updateModder(p),["prevent"]))},[e("i",{class:y(["fas",s.isModder?"fa-minus":"fa-plus"])},null,2)],2)])),[[i,"add/remove yourself from modder list","right"]]):r("",!0)]),e("div",st,[s.beatmap.modders.length==0?(a(),o("i",tt," none ")):(a(),B(d,{key:1,users:s.beatmap.modders},null,8,["users"]))])])])}const at=_(Zs,[["render",et]]),ot=f({name:"NominatorsList",components:{UserLinkList:j},props:{canEdit:Boolean,beatmap:{type:Object,required:!0}},computed:{...C(["loggedInUser"]),isBn(){return this.beatmap.bns.some(s=>s.osuId==this.loggedInUser.osuId)}},methods:{async updateBn(s){s.target.classList.add("fake-button-disable");const t=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/updateBn`);this.$http.isError(t)||this.$store.dispatch("beatmaps/updateBeatmap",t),s.target.classList.remove("fake-button-disable")}}}),it={key:0,class:"ms-1"},nt=e("i",{class:"fas fa-minus"},null,-1),dt=[nt],rt=e("i",{class:"fas fa-plus"},null,-1),lt=[rt],pt={class:"small ms-3"},ut={key:0,class:"text-secondary"};function mt(s,t,n,l,k,u){const d=c("user-link-list"),i=g("bs-tooltip");return a(),o("div",null,[e("div",null,[b(" Nominators ("+m(s.beatmap.bns.length)+") ",1),s.canEdit?h((a(),o("small",it,[s.isBn?(a(),o("a",{key:0,href:"#",class:"text-danger",onClick:t[0]||(t[0]=I(p=>s.updateBn(p),["prevent"]))},dt)):r("",!0),!s.isBn&&s.beatmap.bns.length<2?(a(),o("a",{key:1,href:"#",class:"text-success",onClick:t[1]||(t[1]=I(p=>s.updateBn(p),["prevent"]))},lt)):r("",!0)])),[[i,"add/remove yourself from potential BN list","right"]]):r("",!0)]),e("div",pt,[s.beatmap.bns.length==0?(a(),o("i",ut,"none")):(a(),B(d,{key:1,users:s.beatmap.bns},null,8,["users"]))])])}const ct=_(ot,[["render",mt]]),ht=f({name:"BeatmapLink",props:{beatmap:{type:Object,required:!0}},data(){return{url:"",showLinkInput:!1}},watch:{beatmap(s){s&&(this.showLinkInput=!1,this.url=s.url)}},created(){this.url=this.beatmap.url},methods:{async saveLink(s){const t=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/setLink`,{url:this.url},s);this.$http.isError(t)||(this.showLinkInput=!1,this.$store.dispatch("beatmaps/updateBeatmap",t))}}}),bt={class:"row mb-2"},kt={class:"col"},$t=e("i",{class:"fas fa-edit"},null,-1),ft=[$t],_t={class:"small ms-3"},yt=["href"],vt={key:1,class:"text-secondary"},gt={key:0,class:"row mb-2"},wt={class:"col-sm-12"},It={class:"input-group input-group-sm"};function Bt(s,t,n,l,k,u){const d=g("bs-tooltip");return a(),o("div",null,[e("div",bt,[e("div",kt,[e("div",null,[b(" Link "),h((a(),o("a",{id:"editLink",href:"#",class:y(["text-success small ms-1",{"text-danger":s.showLinkInput}]),onClick:t[0]||(t[0]=I(i=>s.showLinkInput=!s.showLinkInput,["prevent"]))},ft,2)),[[d,"edit link","right"]])]),e("div",_t,[s.beatmap.url?(a(),o("a",{key:0,href:s.beatmap.url,target:"_blank",class:"text-truncate",style:{display:"block"}},m(s.beatmap.url),9,yt)):(a(),o("i",vt,"none"))])])]),s.showLinkInput?(a(),o("div",gt,[e("div",wt,[e("div",It,[h(e("input",{"onUpdate:modelValue":t[1]||(t[1]=i=>s.url=i),class:"form-control form-control-sm",type:"text",placeholder:"URL",onKeyup:t[2]||(t[2]=G(i=>s.saveLink(i),["enter"]))},null,544),[[F,s.url]]),e("button",{id:"addLinkButton",class:"btn btn-outline-info",type:"submit",onClick:t[3]||(t[3]=i=>s.saveLink(i))}," Save ")])])])):r("",!0)])}const Lt=_(ht,[["render",Bt]]),Pt=f({name:"LocksChoice",props:{beatmap:{type:Object,required:!0},beatmapId:{type:String,required:!0}},data(){return{lockTaskSelection:"",showLocksInput:!1,phaseEdit:!1}},computed:{remainingTasks(){var t,n;let s=Z;return(n=(t=this.beatmap)==null?void 0:t.tasksLocked)!=null&&n.length&&(s=s.filter(l=>!this.beatmap.tasksLocked.includes(l))),this.beatmap.mode==O.Taiko&&(s=s.filter(l=>l!==X.Hitsounds)),s}},watch:{beatmapId(){this.showLocksInput=!1},beatmap(){this.beatmap.tasksLocked.length>=6&&(this.showLocksInput=!1)}},methods:{async unlockTask(s,t){t.target.classList.add("fake-button-disable");const n=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/unlockTask`,{task:s});this.$http.isError(n)||this.$store.dispatch("beatmaps/updateBeatmap",n),t.target.classList.remove("fake-button-disable")},async lockTask(s){const t=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/lockTask`,{task:this.lockTaskSelection},s);this.$http.isError(t)||this.$store.dispatch("beatmaps/updateBeatmap",t)}}}),Mt={id:"locks",class:"row mb-1"},qt={class:"col"},Ct=e("i",{class:"fas fa-edit"},null,-1),St=[Ct],Tt={class:"small ms-3"},Et={key:0},At={key:1},Qt=["onClick"],Ot=e("i",{class:"fas fa-minus"},null,-1),Ut=[Ot],jt={class:"text-secondary mx-1"},Dt={key:0,class:"row"},Nt={class:"col"},Ht={class:"input-group input-group-sm"},Rt=["value"],Wt=e("i",{class:"fas fa-lock"},null,-1),Vt=[Wt];function Ft(s,t,n,l,k,u){const d=g("bs-tooltip");return a(),o("div",null,[e("div",Mt,[e("div",qt,[e("div",null,[b(" Locks "),(s.beatmap.mode=="taiko"?s.beatmap.tasksLocked.length<6:s.beatmap.tasksLocked.length<7)?h((a(),o("a",{key:0,class:y(["text-success small ms-1",{"text-danger":s.showLocksInput}]),href:"#",onClick:t[0]||(t[0]=I(i=>s.showLocksInput=!s.showLocksInput,["prevent"]))},St,2)),[[d,"edit locks","right"]]):r("",!0)]),e("div",Tt,[s.beatmap.tasksLocked.length==0?(a(),o("i",Et,"none")):r("",!0),s.beatmap.tasksLocked.length>0?(a(),o("div",At,[(a(!0),o(L,null,P(s.beatmap.tasksLocked,i=>(a(),o("div",{key:i},[h((a(),o("a",{href:"#",class:y(["text-danger",s.phaseEdit?"fake-button-disable":""]),onClick:I(p=>s.unlockTask(i,p),["prevent"])},Ut,10,Qt)),[[d,"unlock","left"]]),e("span",jt,m(i),1)]))),128))])):r("",!0)])])]),s.showLocksInput?(a(),o("div",Dt,[e("div",Nt,[e("div",Ht,[h(e("select",{"onUpdate:modelValue":t[1]||(t[1]=i=>s.lockTaskSelection=i),class:"form-select"},[(a(!0),o(L,null,P(s.remainingTasks,i=>(a(),o("option",{key:i,value:i},m(i),9,Rt))),128))],512),[[T,s.lockTaskSelection]]),h((a(),o("button",{id:"lockTask",class:"btn btn-outline-info",onClick:t[2]||(t[2]=i=>s.lockTask(i))},Vt)),[[d,"prevent other mappers from claiming a difficulty","right"]])])])])):r("",!0)])}const Gt=_(Pt,[["render",Ft]]),zt=f({name:"Points",props:{beatmap:{type:Object,required:!0}},data(){return{tasksPointsArray:null,usersPointsArrays:null,pointsInfo:null,totalPoints:null,bnPoints:null,isLoading:!1}},watch:{beatmap(){this.tasksPointsArray=null,this.usersPointsArrays=null,this.pointsInfo=null,this.totalPoints=null,this.bnPoints=null,this.isLoading=!1}},methods:{async findPoints(s){this.isLoading=!0;const t=await this.$http.executeGet(`/beatmaps/${this.beatmap.id}/findPoints`,s);this.$http.isError(t)||(this.tasksPointsArray=t.tasksPointsArray,this.usersPointsArrays=t.usersPointsArrays,this.pointsInfo=t.pointsInfo,this.totalPoints=t.totalPoints,this.bnPoints=t.bnPoints),this.isLoading=!1}}}),Kt={class:"row"},Xt={class:"col-sm-12"},Zt={key:1,class:"small text-danger"},Jt={key:0},Yt={key:2,class:"small text-secondary ms-2"},xt={key:3,class:"small text-secondary ms-2"},se={key:0,class:"col-sm-6"},te={class:"small text-secondary"},ee=e("li",null,"Map host: 3",-1),ae={class:"col-sm-6"},oe={key:0,class:"small text-secondary"},ie={key:1,class:"col-sm-12"},ne={class:"small text-secondary ms-2"};function de(s,t,n,l,k,u){const d=g("bs-tooltip");return a(),o("div",null,[e("div",Kt,[e("div",Xt,[!s.tasksPointsArray&&!s.beatmap.invalidForPoints?h((a(),o("button",{key:0,class:"btn btn-sm btn-outline-info ms-1",onClick:t[0]||(t[0]=i=>s.findPoints(i))},[b(" Calculate points ")])),[[d,"calculate points for all difficulties"]]):r("",!0),s.beatmap.invalidForPoints?(a(),o("div",Zt,[b(" This beatmap is ineligible for points "),s.beatmap.invalidReason?(a(),o("span",Jt,[b(" for the following reason: "),e("i",null,m(s.beatmap.invalidReason),1)])):r("",!0)])):r("",!0),s.isLoading?(a(),o("div",Yt," calculating... ")):s.pointsInfo?(a(),o("div",xt,m(s.pointsInfo),1)):r("",!0)]),s.tasksPointsArray?(a(),o("div",se,[e("ul",te,[(a(!0),o(L,null,P(s.tasksPointsArray,(i,p)=>(a(),o("li",{key:p},m(i),1))),128)),e("li",null,"BN mod/nomination: "+m(s.bnPoints),1),ee])])):r("",!0),e("div",ae,[s.usersPointsArrays?(a(),o("ul",oe,[(a(!0),o(L,null,P(s.usersPointsArrays,(i,p)=>(a(),o("li",{key:p},m(s.usersPointsArrays[p][0])+": "+m(s.usersPointsArrays[p][0]==s.beatmap.host.username?s.usersPointsArrays[p][1]+5:s.usersPointsArrays[p][1]),1))),128))])):r("",!0)]),s.totalPoints?(a(),o("div",ie,[e("span",ne," total: "+m(Math.round(s.totalPoints*10)/10+5),1)])):r("",!0)])])}const re=_(zt,[["render",de]]),le=f({name:"BeatmapInfo",components:{ModeChoice:vs,StatusChoice:Cs,TasksChoice:J,QuestOrMissionChoice:Xs,ModdersList:at,NominatorsList:ct,BeatmapLink:Lt,LocksChoice:Gt,Points:re},props:{beatmap:{type:Object,required:!0}},data(){return{userQuests:null}},computed:{...C(["loggedInUser"]),isHost(){return this.loggedInUser.id&&this.beatmap?this.loggedInUser.id===this.beatmap.host.id:!1},isRanked(){return this.beatmap.status===A.Ranked},isQualified(){return this.beatmap.status===A.Qualified}},methods:{async deleteMap(s){if(confirm("Are you sure you want to delete?")){s.target.disabled=!0;const n=await this.$http.executePost(`/beatmaps/${this.beatmap.id}/delete`,{},s);this.$http.isError(n)||(this.$bs.hideModal("editBeatmap"),this.$store.commit("beatmaps/deleteBeatmap",n)),s.target.disabled=!1}}}});const E=s=>(z("data-v-dbcec26a"),s=s(),K(),s),pe={key:0,class:"container"},ue={class:"row"},me={key:0,class:"row mb-2"},ce={class:"col-sm-6"},he={key:0,id:"bns",class:"col-sm-6"},be={key:1},ke=E(()=>e("hr",null,null,-1)),$e={class:"row"},fe={class:"col-sm"},_e={key:0,class:"col-lg-5 bm-col-separator-left"},ye={key:0,class:"row"},ve={class:"col-sm"},ge=E(()=>e("hr",null,null,-1)),we={class:"row"},Ie={class:"col-sm"},Be=E(()=>e("hr",null,null,-1)),Le={class:"row"},Pe={class:"col-sm-4 text-end"},Me={class:"small text-secondary"};function qe(s,t,n,l,k,u){const d=c("modders-list"),i=c("nominators-list"),p=c("tasks-choice"),v=c("status-choice"),w=c("mode-choice"),N=c("quest-or-mission-choice"),H=c("beatmap-link"),R=c("locks-choice"),W=c("points");return s.beatmap?(a(),o("div",pe,[e("div",ue,[e("div",{class:y(s.isHost&&!s.isRanked?"col-lg-7":"col-sm-12")},[s.$route.path.includes("worldcup")?(a(),o("div",be,[e("code",null,"https://mappersguild.com/beatmaps?id="+m(s.beatmap.id),1)])):(a(),o("div",me,[e("div",ce,[$(d,{beatmap:s.beatmap,"can-edit":!s.isHost&&!s.isRanked},null,8,["beatmap","can-edit"])]),!s.isRanked||s.beatmap.bns?(a(),o("div",he,[$(i,{beatmap:s.beatmap,"can-edit":!s.isHost&&!s.isRanked},null,8,["beatmap","can-edit"])])):r("",!0)])),ke,e("div",$e,[e("div",fe,[$(p,{beatmap:s.beatmap,"is-host":s.isHost,"is-ranked":s.isRanked,"is-qualified":s.isQualified},null,8,["beatmap","is-host","is-ranked","is-qualified"])])])],2),s.isHost&&!s.isRanked?(a(),o("div",_e,[s.isQualified?r("",!0):(a(),o("div",ye,[e("div",ve,[$(v,{beatmap:s.beatmap},null,8,["beatmap"]),ge])])),e("div",we,[e("div",Ie,[s.beatmap.status=="WIP"?(a(),B(w,{key:0,class:"mb-2",beatmap:s.beatmap},null,8,["beatmap"])):r("",!0)])]),$(N,{beatmap:s.beatmap},null,8,["beatmap"]),s.isQualified?r("",!0):(a(),B(H,{key:1,beatmap:s.beatmap},null,8,["beatmap"])),s.beatmap.status=="WIP"?(a(),B(R,{key:2,beatmap:s.beatmap,"beatmap-id":s.beatmap.id},null,8,["beatmap","beatmap-id"])):r("",!0)])):r("",!0)]),Be,e("div",Le,[$(W,{class:"col-sm-8",beatmap:s.beatmap},null,8,["beatmap"]),e("div",Pe,[e("span",Me," Created: "+m(s.beatmap.createdAt.toString().slice(0,10)),1),s.isHost&&!s.isRanked?(a(),o("button",{key:0,id:"deleteButton",class:"btn btn-sm btn-outline-danger ms-2",onClick:t[0]||(t[0]=V=>s.deleteMap(V))}," Delete ")):r("",!0)])])])):r("",!0)}const Ce=_(le,[["render",qe],["__scopeId","data-v-dbcec26a"]]),Se=f({components:{BeatmapInfo:Ce,ModalDialog:Y,QuestImg:D,ModesIcons:U},props:{selectedBeatmap:{type:Object,default:()=>({})}},watch:{selectedBeatmap(){this.selectedBeatmap&&this.$route.query.id!==this.selectedBeatmap.id&&this.$route.path.includes("beatmaps")&&this.$router.replace(`/beatmaps?id=${this.selectedBeatmap.id}`)}}}),Te=["href"],Ee=e("i",{class:"fas fa-link"},null,-1),Ae={key:1};function Qe(s,t,n,l,k,u){const d=c("quest-img"),i=c("user-link"),p=c("modes-icons"),v=c("beatmap-info"),w=c("modal-dialog");return a(),B(w,{id:"editBeatmap",loaded:!!s.selectedBeatmap,"header-class":s.selectedBeatmap?"bg-"+s.selectedBeatmap.status.toLowerCase():""},{header:Q(()=>[$(d,{beatmap:s.selectedBeatmap},null,8,["beatmap"]),s.selectedBeatmap.url?(a(),o("a",{key:0,href:s.selectedBeatmap.url,target:"_blank"},[Ee,b(" "+m(s.selectedBeatmap.song.artist)+" - "+m(s.selectedBeatmap.song.title),1)],8,Te)):(a(),o("span",Ae,m(s.selectedBeatmap.song.artist)+" - "+m(s.selectedBeatmap.song.title),1)),b(" |"),$(i,{class:"mx-1",user:s.selectedBeatmap.host},null,8,["user"]),$(p,{modes:[s.selectedBeatmap.mode],color:"dark"},null,8,["modes"])]),default:Q(()=>[$(v,{beatmap:s.selectedBeatmap},null,8,["beatmap"])]),_:1},8,["loaded","header-class"])}const Re=_(Se,[["render",Qe]]);export{He as B,Re as E,D as Q,x as _,Ce as a};

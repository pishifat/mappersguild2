import{d as S,R as D,m as P,_ as A,o as u,c as R,w as _,a as t,i as r,e as p,r as $,t as c,F as k,k as w,j as d,y as V,p as f,N as x,b as h,f as b,v as T,n as C,L as E,s as q,u as j}from"./index-e95a7b5e.js";import{M as L}from"./ModalDialog-7c8864ce.js";import{b as F,F as G,c as O}from"./FormTextarea-b4534869.js";import{D as z}from"./DataTable-45d8c70c.js";import{T as B}from"./task-21eeb954.js";const N=S({name:"SubmitMissionModal",components:{ModalDialog:L,FormInput:F,FormSelect:G,FormTextarea:O},props:{isAdmin:Boolean},data(){return{modes:D,featuredArtists:[],selectedArtists:[],selectedArtistId:"",selectedMode:"",selectedModes:[],tier:"",deadline:"",objective:"",name:"",winCondition:"",isShowcaseMission:0,userMaximumRankedBeatmapsCount:null,userMaximumGlobalRank:null,userMaximumPp:null,userMinimumRank:null,beatmapEarliestSubmissionDate:"2007-01-01",beatmapLatestSubmissionDate:"2100-01-01",beatmapMinimumFavorites:null,beatmapMinimumPlayCount:null,beatmapMinimumLength:null,isUniqueToRanked:0}},computed:{...P(["loggedInUser"])},async created(){const i=await this.$http.executeGet("/featuredArtists");i&&(this.featuredArtists=i.sort((s,e)=>s.label.toLowerCase()>e.label.toLowerCase()?1:e.label.toLowerCase()>s.label.toLowerCase()?-1:0))},methods:{addArtist(){if(this.selectedArtistId.length){const i=this.featuredArtists.findIndex(a=>a.id==this.selectedArtistId),s=this.featuredArtists[i],e={id:s.id,_id:s._id,label:s.label,osuId:s.osuId};this.selectedArtists.push(e)}},addMode(){this.selectedMode.length&&this.selectedModes.push(this.selectedMode)},removeArtist(i){const s=this.selectedArtists.findIndex(e=>e.id==i);this.selectedArtists.splice(s,1)},removeMode(i){const s=this.selectedModes.findIndex(e=>e==i);this.selectedModes.splice(s,1)},async addMission(i){if(typeof this.name=="number"){this.$store.dispatch("updateToastMessages",{message:"Choose a name that doesn't start with a number",type:"danger"});return}const s=await this.$http.executePost("/admin/missions/create",{artists:this.selectedArtists,tier:this.tier,name:this.name,deadline:this.deadline,objective:this.objective,modes:this.selectedModes,winCondition:this.winCondition,isShowcaseMission:new Boolean(this.isShowcaseMission),userMaximumRankedBeatmapsCount:this.userMaximumRankedBeatmapsCount,userMaximumGlobalRank:this.userMaximumGlobalRank,userMaximumPp:this.userMaximumPp,userMinimumRank:this.userMinimumRank,beatmapEarliestSubmissionDate:this.beatmapEarliestSubmissionDate,beatmapLatestSubmissionDate:this.beatmapLatestSubmissionDate,beatmapMinimumFavorites:this.beatmapMinimumFavorites,beatmapMinimumPlayCount:this.beatmapMinimumPlayCount,beatmapMinimumLength:this.beatmapMinimumLength,isUniqueToRanked:new Boolean(this.isUniqueToRanked)},i);this.$http.isError(s)||(this.$store.commit("addMission",s),this.$bs.hideModal("submitMission"))}}}),W={class:"container"},Q=t("h5",null,"General",-1),H={class:"row"},J=t("option",{value:"-",disabled:""}," --- ",-1),K=["value"],X={class:"col-sm-1"},Y={class:"small text-secondary"},Z={key:0},ss=["onClick"],is=t("i",{class:"fas fa-minus"},null,-1),ts=[is],es={class:"row"},ns=t("option",{value:"-",disabled:""}," --- ",-1),os=["value"],as={class:"col-sm-1"},ms={class:"mt-2"},ds={class:"small text-secondary"},ls={key:0},us=["onClick"],rs=t("i",{class:"fas fa-minus"},null,-1),ps=[rs],cs=t("hr",null,null,-1),hs=t("h5",null,"User requirements",-1),bs=t("hr",null,null,-1),fs=t("h5",null,"Beatmap requirements",-1);function Ms(i,s,e,a,v,U){const M=f("form-select"),m=f("form-input"),n=f("form-textarea"),y=f("modal-dialog");return u(),R(y,{id:"submitMission",title:"Submit mission","modal-size":"xl"},{default:_(()=>[t("div",W,[Q,t("div",H,[r(M,{modelValue:i.selectedArtistId,"onUpdate:modelValue":s[0]||(s[0]=o=>i.selectedArtistId=o),class:"col-sm-11",label:"Artist",placeholder:"Any artist (selected by default)"},{default:_(()=>[J,(u(!0),p(k,null,$(i.featuredArtists,o=>(u(),p("option",{key:o.id,value:o.id},c(o.label),9,K))),128))]),_:1},8,["modelValue"]),t("div",X,[t("button",{id:"artistButton",class:"btn btn-sm btn-outline-info",onClick:s[1]||(s[1]=o=>i.addArtist())}," Add ")])]),t("div",null,[t("ul",Y,[i.selectedArtists.length?w("",!0):(u(),p("li",Z," Any artist (selected by default) ")),(u(!0),p(k,null,$(i.selectedArtists,o=>(u(),p("li",{key:o.osuId},[d(c(o.label)+" ",1),t("a",{href:"#",class:"text-danger",onClick:V(l=>i.removeArtist(o.id),["prevent"])},ts,8,ss)]))),128))])]),t("div",es,[r(M,{modelValue:i.selectedMode,"onUpdate:modelValue":s[2]||(s[2]=o=>i.selectedMode=o),class:"col-sm-11",label:"Mode",placeholder:"Any mode (selected by default)"},{default:_(()=>[ns,(u(!0),p(k,null,$(i.modes,o=>(u(),p("option",{key:o,value:o},c(o),9,os))),128))]),_:1},8,["modelValue"]),t("div",as,[t("button",{id:"artistButton",class:"btn btn-sm btn-outline-info",onClick:s[3]||(s[3]=o=>i.addMode())}," Add ")])]),t("div",ms,[t("ul",ds,[i.selectedModes.length?w("",!0):(u(),p("li",ls," Any mode (selected by default) ")),(u(!0),p(k,null,$(i.selectedModes,o=>(u(),p("li",{key:o},[d(c(o)+" ",1),t("a",{href:"#",class:"text-danger",onClick:V(l=>i.removeMode(o),["prevent"])},ps,8,us)]))),128))])]),r(m,{modelValue:i.tier,"onUpdate:modelValue":s[4]||(s[4]=o=>i.tier=o),modelModifiers:{number:!0},label:"Tier",type:"number"},null,8,["modelValue"]),r(m,{modelValue:i.name,"onUpdate:modelValue":s[5]||(s[5]=o=>i.name=o),modelModifiers:{number:!0},label:"Name",type:"text"},null,8,["modelValue"]),r(n,{modelValue:i.objective,"onUpdate:modelValue":s[6]||(s[6]=o=>i.objective=o),label:"Objective"},null,8,["modelValue"]),r(n,{modelValue:i.winCondition,"onUpdate:modelValue":s[7]||(s[7]=o=>i.winCondition=o),label:"Win condition"},null,8,["modelValue"]),r(m,{modelValue:i.isShowcaseMission,"onUpdate:modelValue":s[8]||(s[8]=o=>i.isShowcaseMission=o),modelModifiers:{number:!0},label:"isShowcaseMission",description:"0 = false, 1 = true",type:"number"},null,8,["modelValue"]),r(m,{modelValue:i.deadline,"onUpdate:modelValue":s[9]||(s[9]=o=>i.deadline=o),label:"Deadline",type:"date"},null,8,["modelValue"]),cs,hs,r(m,{modelValue:i.userMaximumRankedBeatmapsCount,"onUpdate:modelValue":s[10]||(s[10]=o=>i.userMaximumRankedBeatmapsCount=o),modelModifiers:{number:!0},label:"Max ranked maps",type:"number"},null,8,["modelValue"]),r(m,{modelValue:i.userMaximumGlobalRank,"onUpdate:modelValue":s[11]||(s[11]=o=>i.userMaximumGlobalRank=o),modelModifiers:{number:!0},label:"Max global rank",type:"number"},null,8,["modelValue"]),r(m,{modelValue:i.userMaximumPp,"onUpdate:modelValue":s[12]||(s[12]=o=>i.userMaximumPp=o),modelModifiers:{number:!0},label:"Max pp",type:"number"},null,8,["modelValue"]),r(m,{modelValue:i.userMinimumRank,"onUpdate:modelValue":s[13]||(s[13]=o=>i.userMinimumRank=o),modelModifiers:{number:!0},label:"Minimum mg rank",type:"number"},null,8,["modelValue"]),bs,fs,r(m,{modelValue:i.beatmapEarliestSubmissionDate,"onUpdate:modelValue":s[14]||(s[14]=o=>i.beatmapEarliestSubmissionDate=o),modelModifiers:{number:!0},label:"Earliest submission date",description:"has label and validation if >2007",type:"date"},null,8,["modelValue"]),r(m,{modelValue:i.beatmapLatestSubmissionDate,"onUpdate:modelValue":s[15]||(s[15]=o=>i.beatmapLatestSubmissionDate=o),modelModifiers:{number:!0},label:"Latest submission date",description:"has label and validation if <2050",type:"date"},null,8,["modelValue"]),r(m,{modelValue:i.beatmapMinimumFavorites,"onUpdate:modelValue":s[16]||(s[16]=o=>i.beatmapMinimumFavorites=o),modelModifiers:{number:!0},label:"Minimum favorites",description:"has label and validation if set. paired with minimum playcount (min fav or min playcount)",type:"number"},null,8,["modelValue"]),r(m,{modelValue:i.beatmapMinimumPlayCount,"onUpdate:modelValue":s[17]||(s[17]=o=>i.beatmapMinimumPlayCount=o),modelModifiers:{number:!0},label:"Minimum playcount",description:"has label and validation if set. paired with minimum favorites (min fav or min playcount)",type:"number"},null,8,["modelValue"]),r(m,{modelValue:i.beatmapMinimumLength,"onUpdate:modelValue":s[18]||(s[18]=o=>i.beatmapMinimumLength=o),modelModifiers:{number:!0},label:"Minimum length",description:"in seconds. only label (no validation)",type:"number"},null,8,["modelValue"]),r(m,{modelValue:i.isUniqueToRanked,"onUpdate:modelValue":s[19]||(s[19]=o=>i.isUniqueToRanked=o),modelModifiers:{number:!0},label:"isUniqueToRanked",description:"0 = false, 1 = true. only label (no validation)",type:"number"},null,8,["modelValue"]),t("button",{class:"btn btn-outline-success w-100",onClick:s[20]||(s[20]=o=>i.addMission(o))}," Add mission ")])]),_:1})}const gs=A(N,[["render",Ms]]),vs={state:{missions:[]},mutations:{setMissions(i,s){i.missions=s},updateMission(i,s){const e=i.missions.findIndex(a=>a.id===s.id);e!==-1&&(i.missions[e]=s)},addMission(i,s){i.missions.push(s)},updateName(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.name=s.name)},updateTier(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.tier=s.tier)},updateObjective(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.objective=s.objective)},updateStatus(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.status=s.status)},updateWinCondition(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.winCondition=s.winCondition)},updateIsShowcaseMission(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.isShowcaseMission=s.isShowcaseMission)},updateOpeningAnnounced(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.openingAnnounced=s.openingAnnounced)},updateClosingAnnounced(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.closingAnnounced=s.closingAnnounced)},updateWinningBeatmaps(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.winningBeatmaps=s.winningBeatmaps)},updateInvalidBeatmaps(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.invalidBeatmaps=s.invalidBeatmaps)},updateAssociatedMaps(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.associatedMaps=s.associatedMaps)},updateModes(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.modes=s.modes)},updateArtists(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.artists=s.artists)},updateUserMaximumRankedBeatmapsCount(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.userMaximumRankedBeatmapsCount=s.userMaximumRankedBeatmapsCount)},updateUserMaximumGlobalRank(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.userMaximumGlobalRank=s.userMaximumGlobalRank)},updateUserMaximumPp(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.userMaximumPp=s.userMaximumPp)},updateUserMinimumRank(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.userMinimumRank=s.userMinimumRank)},updateBeatmapEarliestSubmissionDate(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.beatmapEarliestSubmissionDate=s.beatmapEarliestSubmissionDate)},updateBeatmapLatestSubmissionDate(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.beatmapLatestSubmissionDate=s.beatmapLatestSubmissionDate)},updateBeatmapMinimumFavorites(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.beatmapMinimumFavorites=s.beatmapMinimumFavorites)},updateBeatmapMinimumPlayCount(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.beatmapMinimumPlayCount=s.beatmapMinimumPlayCount)},updateBeatmapMinimumLength(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.beatmapMinimumLength=s.beatmapMinimumLength)},updateIsUniqueToRanked(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.isUniqueToRanked=s.isUniqueToRanked)},updateDeadline(i,s){const e=i.missions.find(a=>a.id==s.missionId);e&&(e.deadline=s.deadline)}}},$s=vs,ks=S({name:"MissionInfo",components:{AssociatedBeatmaps:x,ModalDialog:L},props:{mission:{type:Object,required:!0}},data(){return{availableArtists:[],availableModes:D,selectedArtist:{},name:this.mission.name,tier:this.mission.tier,objective:this.mission.objective,winCondition:this.mission.winCondition,status:this.mission.status,mode:"",artists:this.mission.artists,deadline:new Date(this.mission.deadline),userMaximumRankedBeatmapsCount:this.mission.userMaximumRankedBeatmapsCount,userMaximumGlobalRank:this.mission.userMaximumGlobalRank,userMaximumPp:this.mission.userMaximumPp,userMinimumRank:this.mission.userMinimumRank,beatmapEarliestSubmissionDate:new Date(this.mission.beatmapEarliestSubmissionDate),beatmapLatestSubmissionDate:new Date(this.mission.beatmapLatestSubmissionDate),beatmapMinimumFavorites:this.mission.beatmapMinimumFavorites,beatmapMinimumPlayCount:this.mission.beatmapMinimumPlayCount,beatmapMinimumLength:this.mission.beatmapMinimumLength,isUniqueToRanked:this.mission.isUniqueToRanked}},watch:{mission(){this.name=this.mission.name,this.tier=this.mission.tier,this.objective=this.mission.objective,this.winCondition=this.mission.winCondition,this.status=this.mission.status,this.mode="",this.artists=this.mission.artists,this.deadline=new Date(this.mission.deadline),this.userMaximumRankedBeatmapsCount=this.mission.userMaximumRankedBeatmapsCount,this.userMaximumGlobalRank=this.mission.userMaximumGlobalRank,this.userMaximumPp=this.mission.userMaximumPp,this.userMinimumRank=this.mission.userMinimumRank,this.beatmapEarliestSubmissionDate=new Date(this.mission.beatmapEarliestSubmissionDate),this.beatmapLatestSubmissionDate=new Date(this.mission.beatmapLatestSubmissionDate),this.beatmapMinimumFavorites=this.mission.beatmapMinimumFavorites,this.beatmapMinimumPlayCount=this.mission.beatmapMinimumPlayCount,this.beatmapMinimumLength=this.mission.beatmapMinimumLength,this.isUniqueToRanked=this.mission.isUniqueToRanked}},async created(){const i=await this.$http.executeGet("/featuredArtists");i&&(this.availableArtists=i.sort((s,e)=>s.label.toLowerCase()>e.label.toLowerCase()?1:e.label.toLowerCase()>s.label.toLowerCase()?-1:0))},methods:{async updateName(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/rename`,{name:this.name},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"renamed mission",type:"info"}),this.$store.commit("updateName",{missionId:this.mission.id,name:s}))},async updateTier(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateTier`,{tier:this.tier},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated tier",type:"info"}),this.$store.commit("updateTier",{missionId:this.mission.id,tier:s}))},async updateObjective(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateObjective/`,{objective:this.objective},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated objective",type:"info"}),this.$store.commit("updateObjective",{missionId:this.mission.id,objective:s}))},async updateWinCondition(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateWinCondition/`,{winCondition:this.winCondition},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated win condition",type:"info"}),this.$store.commit("updateWinCondition",{missionId:this.mission.id,winCondition:s}))},async updateStatus(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateStatus/`,{status:this.status},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated status",type:"info"}),this.$store.commit("updateStatus",{missionId:this.mission.id,status:s}))},async toggleMode(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleMode/`,{mode:this.mode},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"toggled mode",type:"info"}),this.$store.commit("updateModes",{missionId:this.mission.id,modes:s}))},async toggleArtist(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleArtist/`,{artistLabel:this.selectedArtist},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"toggled artist",type:"info"}),this.$store.commit("updateArtists",{missionId:this.mission.id,artists:s}))},async updateDeadline(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateDeadline/`,{deadline:this.deadline},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated deadline",type:"info"}),this.$store.commit("updateDeadline",{missionId:this.mission.id,deadline:s}))},async toggleIsShowcaseMission(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleIsShowcaseMission/`,{isShowcaseMission:!this.mission.isShowcaseMission},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"toggled isShowcaseMission",type:"info"}),this.$store.commit("updateIsShowcaseMission",{missionId:this.mission.id,isShowcaseMission:s}))},async toggleOpeningAnnounced(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleOpeningAnnounced/`,{openingAnnounced:!this.mission.openingAnnounced},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"toggled openingAnnounced",type:"info"}),this.$store.commit("updateOpeningAnnounced",{missionId:this.mission.id,openingAnnounced:s}))},async toggleClosingAnnounced(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleClosingAnnounced/`,{closingAnnounced:!this.mission.closingAnnounced},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"toggled closingAnnounced",type:"info"}),this.$store.commit("updateClosingAnnounced",{missionId:this.mission.id,closingAnnounced:s}))},async updateUserMaximumRankedBeatmapsCount(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMaximumRankedBeatmapsCount/`,{userMaximumRankedBeatmapsCount:this.userMaximumRankedBeatmapsCount},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated user max ranked maps count for mission",type:"info"}),this.$store.commit("updateUserMaximumRankedBeatmapsCount",{missionId:this.mission.id,userMaximumRankedBeatmapsCount:s}))},async updateUserMaximumGlobalRank(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMaximumGlobalRank/`,{userMaximumGlobalRank:this.userMaximumGlobalRank},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated user max global rank for mission",type:"info"}),this.$store.commit("updateUserMaximumGlobalRank",{missionId:this.mission.id,userMaximumGlobalRank:s}))},async updateUserMaximumPp(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMaximumPp/`,{userMaximumPp:this.userMaximumPp},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated user max pp for mission",type:"info"}),this.$store.commit("updateUserMaximumPp",{missionId:this.mission.id,userMaximumPp:s}))},async updateUserMinimumRank(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateUserMinimumRank/`,{userMinimumRank:this.userMinimumRank},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated user min mg rank for mission",type:"info"}),this.$store.commit("updateUserMinimumRank",{missionId:this.mission.id,userMinimumRank:s}))},async updateBeatmapEarliestSubmissionDate(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapEarliestSubmissionDate/`,{beatmapEarliestSubmissionDate:this.beatmapEarliestSubmissionDate},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated beatmap earliest submission date",type:"info"}),this.$store.commit("updateBeatmapEarliestSubmissionDate",{missionId:this.mission.id,beatmapEarliestSubmissionDate:s}))},async updateBeatmapLatestSubmissionDate(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapLatestSubmissionDate/`,{beatmapLatestSubmissionDate:this.beatmapLatestSubmissionDate},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated beatmap latest submission date",type:"info"}),this.$store.commit("updateBeatmapLatestSubmissionDate",{missionId:this.mission.id,beatmapLatestSubmissionDate:s}))},async updateBeatmapMinimumFavorites(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapMinimumFavorites/`,{beatmapMinimumFavorites:this.beatmapMinimumFavorites},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated beatmap minimum favorites",type:"info"}),this.$store.commit("updateBeatmapMinimumFavorites",{missionId:this.mission.id,beatmapMinimumFavorites:s}))},async updateBeatmapMinimumPlayCount(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapMinimumPlayCount/`,{beatmapMinimumPlayCount:this.beatmapMinimumPlayCount},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated beatmap minimum playcount",type:"info"}),this.$store.commit("updateBeatmapMinimumPlayCount",{missionId:this.mission.id,beatmapMinimumPlayCount:s}))},async updateBeatmapMinimumLength(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/updateBeatmapMinimumLength/`,{beatmapMinimumLength:this.beatmapMinimumLength},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"updated beatmap minimum length",type:"info"}),this.$store.commit("updateBeatmapMinimumLength",{missionId:this.mission.id,beatmapMinimumLength:s}))},async toggleIsUniqueToRanked(i){const s=await this.$http.executePost(`/admin/missions/${this.mission.id}/toggleIsUniqueToRanked/`,{isUniqueToRanked:!this.mission.isUniqueToRanked},i);this.$http.isError(s)||(this.$store.dispatch("updateToastMessages",{message:"toggled isUniqueToRanked",type:"info"}),this.$store.commit("updateIsUniqueToRanked",{missionId:this.mission.id,isUniqueToRanked:s}))}}}),ws={class:"container"},ys={class:"row mt-2 d-flex align-items-center"},Cs=t("div",{class:"col-sm-2"}," Name ",-1),_s={class:"col-sm-6"},Us={class:"col-sm-4"},Is={class:"row mt-2 d-flex align-items-center"},Rs=t("div",{class:"col-sm-2"}," Tier ",-1),Ss={class:"col-sm-6"},As={class:"col-sm-4"},Ts={class:"row mt-2 d-flex align-items-center"},Vs=t("div",{class:"col-sm-2"}," Objective ",-1),Ps={class:"col-sm-6"},Bs={class:"col-sm-4"},Ds={class:"row mt-2 d-flex align-items-center"},Ls=t("div",{class:"col-sm-2"}," Win condition ",-1),xs={class:"col-sm-6"},Es={class:"col-sm-4"},qs={class:"row mt-2 d-flex align-items-center"},js=t("div",{class:"col-sm-2"}," Status ",-1),Fs={class:"col-sm-6"},Gs=t("option",{value:"",disabled:""}," Select a status ",-1),Os=t("option",{value:"hidden"}," Hidden ",-1),zs=t("option",{value:"open"}," Open ",-1),Ns=t("option",{value:"closed"}," Closed ",-1),Ws=[Gs,Os,zs,Ns],Qs={class:"col-sm-4"},Hs={class:"row mt-2 d-flex align-items-center"},Js=t("div",{class:"col-sm-2"}," Mode ",-1),Ks={class:"col-sm-2"},Xs=t("option",{value:"",disabled:""}," Select a mode ",-1),Ys={class:"col-sm-4"},Zs={class:"small text-secondary"},si={class:"col-sm-4"},ii={key:0,class:"row mt-2 d-flex align-items-center"},ti=t("div",{class:"col-sm-2"}," Artists ",-1),ei={class:"col-sm-2"},ni=t("option",{value:{},disabled:""}," Select an artist ",-1),oi={class:"col-sm-4"},ai={class:"small text-secondary"},mi={class:"col-sm-4"},di={class:"row mt-2 d-flex align-items-center"},li=t("div",{class:"col-sm-2"}," Deadline ",-1),ui={class:"col-sm-2"},ri={class:"col-sm-4 small text-secondary"},pi={class:"col-sm-4"},ci={class:"row d-flex mt-2 align-items-center"},hi=t("div",{class:"col-sm-4"}," isShowcaseMission ",-1),bi={class:"col-sm-4 small text-secondary"},fi={class:"col-sm-4"},Mi={class:"row d-flex mt-2 align-items-center"},gi=t("div",{class:"col-sm-4"}," Opening announced ",-1),vi={class:"col-sm-4 small text-secondary"},$i={class:"col-sm-4"},ki={class:"row d-flex mt-2 align-items-center"},wi=t("div",{class:"col-sm-4"}," Closing announced ",-1),yi={class:"col-sm-4 small text-secondary"},Ci={class:"col-sm-4"},_i=t("hr",null,null,-1),Ui=t("h5",null,"User requirements",-1),Ii={class:"row d-flex mt-2 align-items-center"},Ri=t("div",{class:"col-sm-2"}," Max. ranked maps ",-1),Si={class:"col-sm-2"},Ai=t("div",{class:"col-sm-4 small text-secondary"},[d(" Includes: "),t("b",null,"label, validation")],-1),Ti={class:"col-sm-4"},Vi={class:"row d-flex mt-2 align-items-center"},Pi=t("div",{class:"col-sm-2"}," Max. global rank ",-1),Bi={class:"col-sm-2"},Di=t("div",{class:"col-sm-4 small text-secondary"},[d(" Includes: "),t("b",null,"label, validation")],-1),Li={class:"col-sm-4"},xi={class:"row d-flex mt-2 align-items-center"},Ei=t("div",{class:"col-sm-2"}," Max. pp ",-1),qi={class:"col-sm-2"},ji=t("div",{class:"col-sm-4 small text-secondary"},[d(" Includes: "),t("b",null,"label, validation")],-1),Fi={class:"col-sm-4"},Gi={class:"row d-flex mt-2 align-items-center"},Oi=t("div",{class:"col-sm-2"}," Min. MG rank ",-1),zi={class:"col-sm-2"},Ni=t("div",{class:"col-sm-4 small text-secondary"},[d(" Includes: "),t("b",null,"label, validation")],-1),Wi={class:"col-sm-4"},Qi=t("hr",null,null,-1),Hi=t("h5",null,"Beatmap requirements",-1),Ji={class:"row d-flex mt-2 align-items-center"},Ki=t("div",{class:"col-sm-2"}," Earliest submission date ",-1),Xi={class:"col-sm-2"},Yi={class:"col-sm-4 small text-secondary"},Zi=t("div",null,[d("Includes: "),t("b",null,"label, validation"),d(" (if >2007)")],-1),st={class:"col-sm-4"},it={class:"row d-flex mt-2 align-items-center"},tt=t("div",{class:"col-sm-2"}," Latest submission date ",-1),et={class:"col-sm-2"},nt={class:"col-sm-4 small text-secondary"},ot=t("div",null,[d("Includes: "),t("b",null,"label, validation"),d(" (if <2050)")],-1),at={class:"col-sm-4"},mt={class:"row d-flex mt-2 align-items-center"},dt=t("div",{class:"col-sm-2"}," Min. favorites ",-1),lt={class:"col-sm-2"},ut=t("div",{class:"col-sm-4 small text-secondary"},[t("div",null,[d("Includes: "),t("b",null,"label, validation"),d(" (if min. playcount exists)")])],-1),rt={class:"col-sm-4"},pt={class:"row d-flex mt-2 align-items-center"},ct=t("div",{class:"col-sm-2"}," Min. playcount ",-1),ht={class:"col-sm-2"},bt=t("div",{class:"col-sm-4 small text-secondary"},[t("div",null,[d("Includes: "),t("b",null,"label, validation"),d(" (if min. favorites exists)")])],-1),ft={class:"col-sm-4"},Mt={class:"row d-flex mt-2 align-items-center"},gt=t("div",{class:"col-sm-2"}," Min. length ",-1),vt={class:"col-sm-2"},$t=t("div",{class:"col-sm-4 small text-secondary"},[t("div",null,[d("Includes: "),t("b",null,"label")])],-1),kt={class:"col-sm-4"},wt={class:"row d-flex mt-2 align-items-center"},yt=t("div",{class:"col-sm-4"}," isUniqueToRanked ",-1),Ct={class:"col-sm-4 small text-secondary"},_t=t("div",null,[d("Includes: "),t("b",null,"label")],-1),Ut={class:"col-sm-4"},It=t("hr",null,null,-1);function Rt(i,s,e,a,v,U){const M=f("associated-beatmaps"),m=f("modal-dialog");return u(),R(m,{id:"editMission","modal-size":"xl"},{header:_(()=>[d(c(i.mission.name),1)]),default:_(()=>[t("div",ws,[t("div",ys,[Cs,t("div",_s,[h(t("input",{"onUpdate:modelValue":s[0]||(s[0]=n=>i.name=n),class:"form-control form-control-sm",type:"text",autocomplete:"off",placeholder:"mission name..."},null,512),[[b,i.name]])]),t("div",Us,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[1]||(s[1]=n=>i.updateName(n))}," Rename ")])]),t("div",Is,[Rs,t("div",Ss,[h(t("input",{"onUpdate:modelValue":s[2]||(s[2]=n=>i.tier=n),class:"form-control form-control-sm",type:"text",autocomplete:"off",placeholder:"tier..."},null,512),[[b,i.tier]])]),t("div",As,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[3]||(s[3]=n=>i.updateTier(n))}," Update tier ")])]),t("div",Ts,[Vs,t("div",Ps,[h(t("textarea",{"onUpdate:modelValue":s[4]||(s[4]=n=>i.objective=n),class:"form-control form-control-sm",type:"text",autocomplete:"off",placeholder:"mission objective..."},null,512),[[b,i.objective]])]),t("div",Bs,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[5]||(s[5]=n=>i.updateObjective(n))}," Update objective ")])]),t("div",Ds,[Ls,t("div",xs,[h(t("textarea",{"onUpdate:modelValue":s[6]||(s[6]=n=>i.winCondition=n),class:"form-control form-control-sm",type:"text",autocomplete:"off",placeholder:"mission win condition..."},null,512),[[b,i.winCondition]])]),t("div",Es,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[7]||(s[7]=n=>i.updateWinCondition(n))}," Update win condition ")])]),t("div",qs,[js,t("div",Fs,[h(t("select",{"onUpdate:modelValue":s[8]||(s[8]=n=>i.status=n),class:"form-select form-select-sm"},Ws,512),[[T,i.status]])]),t("div",Qs,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[9]||(s[9]=n=>i.updateStatus(n))}," Update status ")])]),t("div",Hs,[Js,t("div",Ks,[h(t("select",{"onUpdate:modelValue":s[10]||(s[10]=n=>i.mode=n),class:"form-select form-select-sm"},[Xs,(u(!0),p(k,null,$(i.availableModes,n=>(u(),p("option",{key:n},c(n),1))),128))],512),[[T,i.mode]])]),t("div",Ys,[t("div",Zs,[d(" Current: "),t("b",null,c(i.mission.modes),1)])]),t("div",si,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[11]||(s[11]=n=>i.toggleMode(n))}," Toggle mode ")])]),i.availableArtists?(u(),p("div",ii,[ti,t("div",ei,[h(t("select",{"onUpdate:modelValue":s[12]||(s[12]=n=>i.selectedArtist=n),class:"form-select form-select-sm"},[ni,(u(!0),p(k,null,$(i.availableArtists,n=>(u(),p("option",{key:n.id},c(n.label),1))),128))],512),[[T,i.selectedArtist]])]),t("div",oi,[t("div",ai,[d(" Current: "),t("b",null,c(i.mission.artists.map(n=>n.label)),1)])]),t("div",mi,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[13]||(s[13]=n=>i.toggleArtist(n))}," Toggle artist ")])])):w("",!0),t("div",di,[li,t("div",ui,[h(t("input",{"onUpdate:modelValue":s[14]||(s[14]=n=>i.deadline=n),class:"form-control form-control-sm",type:"date",autocomplete:"off",placeholder:"deadline..."},null,512),[[b,i.deadline]])]),t("div",ri,[d(" Current: "),t("b",null,c(i.mission.deadline),1)]),t("div",pi,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[15]||(s[15]=n=>i.updateDeadline(n))}," Update deadline ")])]),t("div",ci,[hi,t("div",bi,[d(" Current: "),t("b",{class:C(i.mission.isShowcaseMission?"text-success":"text-danger")},c(i.mission.isShowcaseMission?i.mission.isShowcaseMission:"false"),3)]),t("div",fi,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[16]||(s[16]=n=>i.toggleIsShowcaseMission(n))}," Toggle isShowcaseMission ")])]),t("div",Mi,[gi,t("div",vi,[d(" Current: "),t("b",{class:C(i.mission.openingAnnounced?"text-success":"text-danger")},c(i.mission.openingAnnounced),3)]),t("div",$i,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[17]||(s[17]=n=>i.toggleOpeningAnnounced(n))}," Toggle openingAnnounced ")])]),t("div",ki,[wi,t("div",yi,[d(" Current: "),t("b",{class:C(i.mission.closingAnnounced?"text-success":"text-danger")},c(i.mission.closingAnnounced),3)]),t("div",Ci,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[18]||(s[18]=n=>i.toggleClosingAnnounced(n))}," Toggle closingAnnounced ")])]),_i,Ui,t("div",Ii,[Ri,t("div",Si,[h(t("input",{"onUpdate:modelValue":s[19]||(s[19]=n=>i.userMaximumRankedBeatmapsCount=n),class:"form-control form-control-sm",type:"text",autocomplete:"off",placeholder:"max ranked maps..."},null,512),[[b,i.userMaximumRankedBeatmapsCount]])]),Ai,t("div",Ti,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[20]||(s[20]=n=>i.updateUserMaximumRankedBeatmapsCount(n))}," Update user max ranked maps count ")])]),t("div",Vi,[Pi,t("div",Bi,[h(t("input",{"onUpdate:modelValue":s[21]||(s[21]=n=>i.userMaximumGlobalRank=n),class:"form-control form-control-sm",type:"number",autocomplete:"off",placeholder:"max global rank..."},null,512),[[b,i.userMaximumGlobalRank]])]),Di,t("div",Li,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[22]||(s[22]=n=>i.updateUserMaximumGlobalRank(n))}," Update user max global rank ")])]),t("div",xi,[Ei,t("div",qi,[h(t("input",{"onUpdate:modelValue":s[23]||(s[23]=n=>i.userMaximumPp=n),class:"form-control form-control-sm",type:"number",autocomplete:"off",placeholder:"max pp..."},null,512),[[b,i.userMaximumPp]])]),ji,t("div",Fi,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[24]||(s[24]=n=>i.updateUserMaximumPp(n))}," Update user max pp ")])]),t("div",Gi,[Oi,t("div",zi,[h(t("input",{"onUpdate:modelValue":s[25]||(s[25]=n=>i.userMinimumRank=n),class:"form-control form-control-sm",type:"number",autocomplete:"off",placeholder:"min mg rank..."},null,512),[[b,i.userMinimumRank]])]),Ni,t("div",Wi,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[26]||(s[26]=n=>i.updateUserMinimumRank(n))}," Update user min rank ")])]),Qi,Hi,t("div",Ji,[Ki,t("div",Xi,[h(t("input",{"onUpdate:modelValue":s[27]||(s[27]=n=>i.beatmapEarliestSubmissionDate=n),class:"form-control form-control-sm",type:"date",autocomplete:"off",placeholder:"earliest submission date allowed..."},null,512),[[b,i.beatmapEarliestSubmissionDate]])]),t("div",Yi,[Zi,t("div",null,[d("Current: "),t("b",null,c(i.mission.beatmapEarliestSubmissionDate),1)])]),t("div",st,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[28]||(s[28]=n=>i.updateBeatmapEarliestSubmissionDate(n))}," Update beatmap earliest submission date ")])]),t("div",it,[tt,t("div",et,[h(t("input",{"onUpdate:modelValue":s[29]||(s[29]=n=>i.beatmapLatestSubmissionDate=n),class:"form-control form-control-sm",type:"date",autocomplete:"off",placeholder:"latest submission date allowed..."},null,512),[[b,i.beatmapLatestSubmissionDate]])]),t("div",nt,[ot,t("div",null,[d("Current: "),t("b",null,c(i.mission.beatmapLatestSubmissionDate),1)])]),t("div",at,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[30]||(s[30]=n=>i.updateBeatmapLatestSubmissionDate(n))}," Update beatmap latest submission date ")])]),t("div",mt,[dt,t("div",lt,[h(t("input",{"onUpdate:modelValue":s[31]||(s[31]=n=>i.beatmapMinimumFavorites=n),class:"form-control form-control-sm",type:"number",autocomplete:"off",placeholder:"min favorites..."},null,512),[[b,i.beatmapMinimumFavorites]])]),ut,t("div",rt,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[32]||(s[32]=n=>i.updateBeatmapMinimumFavorites(n))}," Update beatmap minimum favorites ")])]),t("div",pt,[ct,t("div",ht,[h(t("input",{"onUpdate:modelValue":s[33]||(s[33]=n=>i.beatmapMinimumPlayCount=n),class:"form-control form-control-sm",type:"number",autocomplete:"off",placeholder:"min playcount..."},null,512),[[b,i.beatmapMinimumPlayCount]])]),bt,t("div",ft,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[34]||(s[34]=n=>i.updateBeatmapMinimumPlayCount(n))}," Update beatmap minimum playcount ")])]),t("div",Mt,[gt,t("div",vt,[h(t("input",{"onUpdate:modelValue":s[35]||(s[35]=n=>i.beatmapMinimumLength=n),class:"form-control form-control-sm",type:"number",autocomplete:"off",placeholder:"min length..."},null,512),[[b,i.beatmapMinimumLength]])]),$t,t("div",kt,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[36]||(s[36]=n=>i.updateBeatmapMinimumLength(n))}," Update beatmap minimum length ")])]),t("div",wt,[yt,t("div",Ct,[_t,t("div",null,[d(" Current: "),t("b",{class:C(i.mission.isUniqueToRanked?"text-success":"text-danger")},c(i.mission.isUniqueToRanked?i.mission.isUniqueToRanked:"false"),3)])]),t("div",Ut,[t("button",{class:"btn btn-sm btn-outline-info w-100",onClick:s[37]||(s[37]=n=>i.toggleIsUniqueToRanked(n))}," Toggle isUniqueToRanked ")])]),It,i.mission.associatedMaps&&i.mission.associatedMaps.length?(u(),R(M,{key:1,class:"my-4",mission:i.mission,"is-admin-page":!0},null,8,["mission"])):w("",!0)])]),_:1})}const St=A(ks,[["render",Rt]]),At=S({name:"MissionWinners",computed:{...P({missions:i=>i.missionsAdmin.missions}),closedMissions(){return this.missions.filter(i=>i.status==E.Closed)}},methods:{loadWinners(){let i=[];for(const l of this.closedMissions)i=i.concat(l.winningBeatmaps);const s=i.map(l=>l.host),e=s.map(l=>l.username);let a=[],v=[];for(const l of i)if(l.mission.toString()=="65a3376e48f36f2622ef2f44"){for(const g of l.tasks)if(g.name!==B.Hitsounds&&g.name!==B.Storyboard)for(const I of g.mappers)!v.includes(I.username)&&l.host.id!==I.id&&(a.push(I),v.push(I.username))}const U=s.concat(a);let m=e.concat(v).reduce(function(l,g){return l[g]?++l[g]:l[g]=1,l},{});const n=[],y=[];for(const l of U)y.includes(l.osuId)||(y.push(l.osuId),n.push({username:l.username,osuId:l.osuId,total:m[l.username],isQuestTrailblazer:l.isQuestTrailblazer}));return n.sort((l,g)=>g.total-l.total)},async toggleIsQuestTrailblazer(i,s){const e=await this.$http.executePost("/admin/missions/toggleIsQuestTrailblazer/",{userOsuId:i},s);this.$http.isError(e)||this.$store.dispatch("updateToastMessages",{message:"toggled isQuestTrailblazer, refresh to see changes",type:"info"})}}}),Tt={class:"container card card-body py-1 my-2"},Vt={key:0},Pt=["onClick"];function Bt(i,s,e,a,v,U){const M=f("user-link");return u(),p("div",Tt,[(u(!0),p(k,null,$(i.loadWinners(),m=>(u(),p("div",{key:m.osuId},[r(M,{user:m},null,8,["user"]),d(" - "+c(m.total)+" ",1),m.total>=3&&!m.isQuestTrailblazer?(u(),p("code",Vt,".add-badge "+c(m.osuId)+` questtrailblazer.png "Completed 3+ priority quests in the Mappers' Guild" https://osu.ppy.sh/wiki/en/Community/Mappers_Guild#additional-rewards`,1)):w("",!0),m.total>=3&&!m.isQuestTrailblazer?(u(),p("button",{key:1,class:"btn btn-outline-info btn-sm ms-2",href:"#",onClick:V(n=>i.toggleIsQuestTrailblazer(m.osuId,n),["prevent"])}," click this after giving user badge ",8,Pt)):w("",!0)]))),128))])}const Dt=A(At,[["render",Bt]]),Lt=S({components:{DataTable:z,SubmitMissionModal:gs,MissionInfo:St,MissionWinners:Dt},data(){return{selectedMissionId:""}},computed:{...P({missions:i=>i.missionsAdmin.missions}),selectedMission(){return this.missions.find(i=>i.id===this.selectedMissionId)}},beforeCreate(){this.$store.hasModule("missionsAdmin")||this.$store.registerModule("missionsAdmin",$s)},unmounted(){this.$store.hasModule("missionsAdmin")&&this.$store.unregisterModule("missionsAdmin")},async created(){const i=await this.$http.initialRequest("/admin/missions/load");this.$http.isError(i)||this.$store.commit("setMissions",i)},methods:{updateMission(i){const s=this.missions.findIndex(e=>e.id==i.id);s!==-1&&(this.missions[s]=i)},findTierImage(i){switch(i){case 1:return"/images/bronze.png";case 2:return"/images/silver.png";case 3:return"/images/gold.png";case 4:return"/images/platinum.png";default:return"/images/bronze.png"}}}});const xt=i=>(q("data-v-e57f7ab8"),i=i(),j(),i),Et={class:"container card card-body py-1"},qt={class:"row"},jt={class:"col"},Ft=xt(()=>t("button",{class:"btn btn-sm btn-info w-100 mb-1","data-bs-toggle":"modal","data-bs-target":"#submitMission"}," Add mission ",-1)),Gt=["src"];function Ot(i,s,e,a,v,U){const M=f("data-table"),m=f("mission-winners"),n=f("submit-mission-modal"),y=f("mission-info");return u(),p("div",null,[t("div",Et,[t("div",qt,[t("div",jt,[Ft,r(M,{data:i.missions,headers:["name","tier","status","announce"],"custom-data-target":"#editMission","onUpdate:selectedId":s[0]||(s[0]=o=>i.selectedMissionId=o)},{default:_(({obj:o})=>[t("td",null,c(o.name),1),t("td",null,[t("img",{src:i.findTierImage(o.tier),class:"table-mission-tier"},null,8,Gt)]),t("td",null,c(o.status),1),t("td",null,[t("span",{class:C(o.openingAnnounced?"text-success":"text-danger")},"open",2),d("/"),t("span",{class:C(o.closingAnnounced?"text-success":"text-danger")},"close",2)])]),_:1},8,["data"])])])]),r(m),r(n),i.selectedMission?(u(),R(y,{key:0,mission:i.selectedMission,onUpdateMission:s[1]||(s[1]=o=>i.updateMission(o))},null,8,["mission"])):w("",!0)])}const Jt=A(Lt,[["render",Ot],["__scopeId","data-v-e57f7ab8"]]);export{Jt as default};

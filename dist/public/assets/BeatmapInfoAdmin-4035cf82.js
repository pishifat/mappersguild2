import{M as y}from"./ModalDialog-aa64ebeb.js";import{S as T}from"./task-21eeb954.js";import{d as S,M as C,_ as M,o as i,c as W,w as c,e as n,t as o,j as d,a as e,i as u,b as p,v as h,r as f,F as k,f as b,k as v,p as l}from"./index-000cdd67.js";import{T as U}from"./TasksChoice-5f221bcb.js";const B=S({name:"BeatmapInfoAdmin",components:{ModalDialog:y,ModesIcons:C,TasksChoice:U},props:{beatmap:{type:Object,required:!0}},data(){return{status:this.beatmap.status,taskId:null,modderId:null,beatmapUrl:this.beatmap.url,packId:this.beatmap.packId,rejectionInput:""}},computed:{sortedTasks(){const s=T;return[...this.beatmap.tasks].sort(function(t,m){return s.indexOf(t.name)-s.indexOf(m.name)})}},watch:{beatmap(){this.findBeatmapInfo()}},mounted(){this.findBeatmapInfo()},methods:{findBeatmapInfo(){this.status=this.beatmap.status,this.taskId=null,this.modderId=null,this.beatmapUrl=this.beatmap.url,this.packId=this.beatmap.packId,this.rejectionInput=""},findTaskInfo(s){let t=`${s.name} --- `;const m=s.mappers.map(r=>r.username);return t+=m.join(", "),t},async updateBeatmapStatus(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateStatus`,{status:this.status},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated beatmap status",type:"info"}),this.$store.commit("updateBeatmapStatus",{beatmapId:this.beatmap.id,status:t}))},async deleteTask(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/tasks/${this.taskId}/delete`,{},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"deleted task",type:"info"}),this.$store.commit("deleteTask",{beatmapId:this.beatmap.id,taskId:this.taskId}))},async deleteModder(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/modders/${this.modderId}/delete`,{},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"deleted modder",type:"info"}),this.$store.commit("deleteModder",{beatmapId:this.beatmap.id,modderId:this.modderId}))},async updateUrl(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateUrl`,{url:this.beatmapUrl},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated URL",type:"info"}),this.$store.commit("updateUrl",{beatmapId:this.beatmap.id,url:t}))},async updatePackId(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updatePackId`,{packId:this.packId},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"updated pack id",type:"info"}),this.$store.commit("updatePackId",{beatmapId:this.beatmap.id,packId:t}))},async updateIsShowcase(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateIsShowcase`,{isShowcase:!this.beatmap.isShowcase},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:`updated isShowcase: ${t}`,type:"info"}),this.$store.commit("updateIsShowcase",{beatmapId:this.beatmap.id,isShowcase:t}))},async updateIsWorldCup(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateIsWorldCup`,{isWorldCup:!this.beatmap.isWorldCup},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:`updated isWorldCup: ${t}`,type:"info"}),this.$store.commit("updateIsWorldCup",{beatmapId:this.beatmap.id,isWorldCup:t}))},async updateQueuedForRank(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateQueuedForRank`,{queuedForRank:!this.beatmap.queuedForRank},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:`updated queuedForRank: ${t}`,type:"info"}),this.$store.commit("updateQueuedForRank",{beatmapId:this.beatmap.id,queuedForRank:t}))},async updateSkipWebhook(s){const t=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/updateSkipWebhook`,{skipWebhook:!this.beatmap.skipWebhook},s);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:`updated skipWebhook: ${t}`,type:"info"}),this.$store.commit("updateSkipBeatmapWebhook",{beatmapId:this.beatmap.id,skipWebhook:t}))},async rejectMapset(s,t){if(confirm("Are you sure?")){const r=await this.$http.executePost(`/admin/beatmaps/${this.beatmap.id}/rejectMapset`,{messages:this.rejectionInput,isResolvable:t},s);this.$http.isError(r)||(this.$store.dispatch("updateToastMessages",{message:"updated beatmap status",type:"info"}),this.$store.commit("updateBeatmapStatus",{beatmapId:this.beatmap.id,status:r}))}}}}),R=["href"],P={key:1},j=["href"],F={class:"container"},_={class:"row"},E={class:"row"},V=["value"],Q=e("hr",null,null,-1),q={class:"row"},D=e("option",{value:"WIP"}," WIP ",-1),O=e("option",{value:"Done"}," Done ",-1),A=e("option",{value:"Qualified"}," Qualified ",-1),N=e("option",{value:"Ranked"}," Ranked ",-1),L=[D,O,A,N],G={class:"row"},H=["value"],z={class:"row"},J={class:"row"},K={class:"row"},X={class:"col-sm-6"},Y={class:"text-danger me-2"},Z={class:"row"},x={class:"col-sm-6"},tt={class:"text-danger me-2"},st={key:0},et={class:"row"},at={class:"col-sm-6"},ot={class:"text-danger me-2"},it={class:"row"},nt={class:"col-sm-6"},dt={class:"text-danger me-2"},pt={class:"row"};function mt(s,t,m,r,rt,lt){const I=l("user-link"),$=l("modes-icons"),w=l("tasks-choice"),g=l("modal-dialog");return i(),W(g,{id:"editBeatmap",loaded:!!s.beatmap},{header:c(()=>[s.beatmap.url?(i(),n("a",{key:0,href:s.beatmap.url,target:"_blank"},o(s.beatmap.song.artist)+" - "+o(s.beatmap.song.title),9,R)):(i(),n("span",P,o(s.beatmap.song.artist)+" - "+o(s.beatmap.song.title),1)),d(" | "),e("a",{href:`/beatmaps?id=${s.beatmap.id}`,target:"_blank"},"MG url",8,j),d(" | "),u(I,{class:"me-1",user:s.beatmap.host},null,8,["user"]),u($,{modes:[s.beatmap.mode],color:"dark"},null,8,["modes"])]),default:c(()=>[e("div",F,[e("div",_,[u(w,{beatmap:s.beatmap,"is-host":!0,"is-qualified":!1,"is-ranked":!1,"is-admin":!0},null,8,["beatmap"])]),e("p",E,[p(e("select",{"onUpdate:modelValue":t[0]||(t[0]=a=>s.taskId=a),class:"form-select form-select-sm w-50 mx-2"},[(i(!0),n(k,null,f(s.sortedTasks,a=>(i(),n("option",{key:a.id,value:a.id},o(s.findTaskInfo(a)),9,V))),128))],512),[[h,s.taskId]]),e("button",{class:"btn btn-sm btn-outline-danger w-25",onClick:t[1]||(t[1]=a=>s.deleteTask(a))}," Remove difficulty ")]),Q,e("p",q,[p(e("select",{"onUpdate:modelValue":t[2]||(t[2]=a=>s.status=a),class:"form-select form-select-sm w-50 mx-2"},L,512),[[h,s.status]]),e("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[3]||(t[3]=a=>s.updateBeatmapStatus(a))}," Save status ")]),e("p",G,[p(e("select",{"onUpdate:modelValue":t[4]||(t[4]=a=>s.modderId=a),class:"form-select form-select-sm w-50 mx-2"},[(i(!0),n(k,null,f(s.beatmap.modders,a=>(i(),n("option",{key:a.id,value:a.id},o(a.username),9,H))),128))],512),[[h,s.modderId]]),e("button",{class:"btn btn-sm btn-outline-danger w-25",onClick:t[5]||(t[5]=a=>s.deleteModder(a))}," Remove modder ")]),e("p",z,[p(e("input",{"onUpdate:modelValue":t[6]||(t[6]=a=>s.beatmapUrl=a),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off",placeholder:"beatmap url..."},null,512),[[b,s.beatmapUrl]]),e("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[7]||(t[7]=a=>s.updateUrl(a))}," Save URL ")]),e("p",J,[p(e("input",{"onUpdate:modelValue":t[8]||(t[8]=a=>s.packId=a),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off",placeholder:"osu! beatmap pack ID..."},null,512),[[b,s.packId]]),e("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[9]||(t[9]=a=>s.updatePackId(a))}," Save pack ID ")]),e("p",K,[e("span",X,[d(" Featured Artist showcase: "),e("span",Y,o(s.beatmap.isShowcase?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:t[10]||(t[10]=a=>s.updateIsShowcase(a))}," Toggle ")]),e("p",Z,[e("span",x,[d(" World cup original: "),e("span",tt,o(s.beatmap.isWorldCup?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:t[11]||(t[11]=a=>s.updateIsWorldCup(a))}," Toggle ")]),s.beatmap.status=="Qualified"?(i(),n("span",st,[e("p",et,[e("span",at,[d(" Queued for rank: "),e("span",ot,o(s.beatmap.queuedForRank?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:t[12]||(t[12]=a=>s.updateQueuedForRank(a))}," Toggle ")]),e("p",it,[e("span",nt,[d(" Skip webhook: "),e("span",dt,o(s.beatmap.skipWebhook?"true":"false"),1)]),e("button",{class:"btn btn-sm btn-outline-info ms-3 w-25",onClick:t[13]||(t[13]=a=>s.updateSkipWebhook(a))}," Toggle ")]),e("p",pt,[p(e("textarea",{"onUpdate:modelValue":t[14]||(t[14]=a=>s.rejectionInput=a),class:"form-control form-control-sm w-25",type:"text",autocomplete:"off",placeholder:"messages separated by new lines..."},null,512),[[b,s.rejectionInput]]),e("button",{class:"btn btn-sm btn-outline-info ms-2 w-25",onClick:t[15]||(t[15]=a=>s.rejectMapset(a,!0))}," Reject with resolution option "),e("button",{class:"btn btn-sm btn-outline-danger ms-2 w-25",onClick:t[16]||(t[16]=a=>s.rejectMapset(a,!1))}," Reject WITHOUT resolution ")])])):v("",!0)])]),_:1},8,["loaded"])}const ft=M(B,[["render",mt]]);export{ft as B};

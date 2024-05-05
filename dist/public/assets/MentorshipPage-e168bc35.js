import{d as M,m as k,z as P,_ as w,o as r,e as l,a as s,F as b,r as I,i as c,y as p,b as f,f as $,g as T,p as g,v as N,t as h,j as _,k as v,n as D,q as L,s as V,u as B}from"./index-3a3c2d9b.js";import{m as U,A as K}from"./AddUserManually-f1a77404.js";const R=M({name:"Administrators",components:{},data(){return{userInput:null,confirmDelete:null}},computed:{...k(["loggedInUser"]),...P("mentorship",["allAdmins"])},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",U)},methods:{async toggleIsMentorshipAdmin(e,t){const n=await this.$http.executePost("/mentorship/toggleIsMentorshipAdmin",{userInput:this.userInput,userId:t},e);if(!this.$http.isError(n))if(this.$store.dispatch("updateToastMessages",{message:`${n.isMentorshipAdmin?"Added":"Removed"}`,type:"info"}),n.isMentorshipAdmin){const a=[...this.allAdmins];a.push(n),this.$store.commit("mentorship/setAdmins",a)}else this.$store.commit("mentorship/removeAdmin",t)}}}),G={class:"container card card-body py-3"},z=s("h5",null,"Mentorship Administrators",-1),F=s("div",{class:"text-secondary"}," Users with access to mentorship tools: ",-1),j=["onClick"],q=["onClick"],H={class:"input-group w-25"},J={class:"input-group-append"},O=s("i",{class:"fas fa-plus fa-xs"},null,-1),Q=[O];function W(e,t,n,a,m,y){const i=g("user-link");return r(),l("div",null,[s("div",G,[z,F,s("ul",null,[(r(!0),l(b,null,I(e.allAdmins,o=>(r(),l("li",{key:o.id},[c(i,{user:o},null,8,["user"]),e.confirmDelete!=o.id?(r(),l("a",{key:0,href:"#",class:"text-danger",onClick:p(d=>e.confirmDelete=o.id,["prevent"])}," delete ",8,j)):(r(),l("a",{key:1,class:"text-danger",href:"#",onClick:p(d=>e.toggleIsMentorshipAdmin(d,o.id),["prevent"])}," confirm ",8,q))]))),128))]),s("div",H,[f(s("input",{"onUpdate:modelValue":t[0]||(t[0]=o=>e.userInput=o),class:"form-control form-control-sm",autocomplete:"off",placeholder:"new admin username/osuId...",onKeyup:t[1]||(t[1]=T(o=>e.toggleIsMentorshipAdmin(o,null),["enter"]))},null,544),[[$,e.userInput,void 0,{number:!0}]]),s("div",J,[s("button",{class:"btn btn-primary",href:"#",onClick:t[2]||(t[2]=p(o=>e.toggleIsMentorshipAdmin(o,null),["prevent"]))},Q)])])])])}const X=w(R,[["render",W]]),Y=M({name:"Cycles",data(){return{cycleNumberInput:null,cycleNameInput:null,cycleUrlInput:null,cycleStartInput:null,cycleEndInput:null,duplicateCycleId:""}},computed:{...k(["loggedInUser"]),...P("mentorship",["allCycles"])},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",U)},methods:{async addCycle(e){if(confirm("Are you sure? Details cannot be changed after adding.")){const n=await this.$http.executePost("/mentorship/addCycle",{number:this.cycleNumberInput,name:this.cycleNameInput,url:this.cycleUrlInput,startDate:this.cycleStartInput,endDate:this.cycleEndInput,duplicateCycleId:this.duplicateCycleId},e);if(!this.$http.isError(n)){this.$store.dispatch("updateToastMessages",{message:`Added "${n.number} - ${n.name}"`,type:"info"});const a=[...this.allCycles];a.unshift(n),this.$store.commit("mentorship/setCycles",a)}}}}}),Z={class:"container card card-body py-3 mb-2"},x=s("h5",null,"New cycle",-1),ee=s("div",{class:"text-secondary"}," Add a new cycle based on input below. ",-1),te=s("div",{class:"text-secondary"}," To copy relationships from an existing cycle, select the cycle in the dropdown. ",-1),se={class:"row"},oe={class:"col-sm-6 mb-2"},ne=s("option",{value:"",selected:"",disabled:""}," Select a cycle to duplicate ",-1),ie=["value"],re={class:"input-group mt-2"},le={class:"input-group-append"},ae=s("i",{class:"fas fa-plus fa-xs"},null,-1),de=[ae];function ce(e,t,n,a,m,y){return r(),l("div",null,[s("div",Z,[x,ee,te,s("div",se,[s("div",oe,[f(s("select",{"onUpdate:modelValue":t[0]||(t[0]=i=>e.duplicateCycleId=i),class:"form-select form-select d-inline"},[ne,(r(!0),l(b,null,I(e.allCycles,i=>(r(),l("option",{key:i.id,value:i.id},h(i.number)+" - "+h(i.name),9,ie))),128))],512),[[N,e.duplicateCycleId]])])]),s("div",re,[f(s("input",{"onUpdate:modelValue":t[1]||(t[1]=i=>e.cycleNumberInput=i),class:"form-control form-control-sm",autocomplete:"off",type:"number",placeholder:"new cycle number..."},null,512),[[$,e.cycleNumberInput,void 0,{number:!0}]]),f(s("input",{"onUpdate:modelValue":t[2]||(t[2]=i=>e.cycleNameInput=i),class:"form-control form-control-sm",autocomplete:"off",placeholder:"new cycle name..."},null,512),[[$,e.cycleNameInput,void 0,{number:!0}]]),f(s("input",{"onUpdate:modelValue":t[3]||(t[3]=i=>e.cycleUrlInput=i),class:"form-control form-control-sm",autocomplete:"off",placeholder:"cycle details link..."},null,512),[[$,e.cycleUrlInput,void 0,{number:!0}]]),f(s("input",{"onUpdate:modelValue":t[4]||(t[4]=i=>e.cycleStartInput=i),class:"form-control form-control-sm",type:"date"},null,512),[[$,e.cycleStartInput]]),f(s("input",{"onUpdate:modelValue":t[5]||(t[5]=i=>e.cycleEndInput=i),class:"form-control form-control-sm",type:"date"},null,512),[[$,e.cycleEndInput]]),s("div",le,[s("button",{class:"btn btn-primary",href:"#",onClick:t[6]||(t[6]=p(i=>e.addCycle(i),["prevent"]))},de)])])])])}const ue=w(Y,[["render",ce]]),pe=M({name:"ParticipantList",props:{mode:{type:String,default:""}},data(){return{mentorInput:null,menteeInput:null,editingMentorId:"",confirmDeleteMentor:"",confirmDeleteMentee:"",phaseEdit:!1}},computed:{...k(["loggedInUser"]),...k("mentorship",["showPhases"]),...P("mentorship",["selectedCycle"]),modeMentors(){return this.selectedCycle.participants.filter(t=>{for(const n of t.mentorships)if(n.mode==this.mode&&n.group=="mentor"&&n.cycle.toString()==this.selectedCycle.id)return!0}).sort((t,n)=>t.username.toLowerCase()>n.username.toLowerCase()?1:n.username.toLowerCase()>t.username.toLowerCase()?-1:0)},modeMentees(){return this.selectedCycle.participants.filter(t=>{for(const n of t.mentorships)if(n.mode==this.mode&&n.group=="mentee"&&n.cycle.toString()==this.selectedCycle.id)return!0}).sort((t,n)=>t.username.toLowerCase()>n.username.toLowerCase()?1:n.username.toLowerCase()>t.username.toLowerCase()?-1:0)},title(){return this.mode=="modding"||this.mode=="graduation"||this.mode=="storyboard"?this.mode:this.mode=="osu"?"osu!":"osu!"+this.mode}},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",U)},methods:{findMentees(e){return this.modeMentees.filter(n=>{for(const a of n.mentorships)if(a.group=="mentee"&&a.mentor.toString()==e&&a.cycle.toString()==this.selectedCycle.id)return!0})},isPhaseParticipant(e,t,n){const a=e.mentorships.find(m=>m.cycle.toString()==this.selectedCycle.id&&m.mode==this.mode&&(m.mentor?m.mentor.toString()==n:n==e.id));return!!(a&&a.phases.includes(t))},involvedInAllPhases(e){return e.mentorships.find(n=>n.cycle.toString()==this.selectedCycle.id&&n.mode==this.mode).phases.length==3},async addMentor(e){const t=await this.$http.executePost("/mentorship/addMentor",{cycleId:this.selectedCycle.id,userInput:this.mentorInput,mode:this.mode},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:`Added "${this.mentorInput}"`,type:"info"}),this.$store.commit("mentorship/updateCycle",t),this.mentorInput=null)},async addMentee(e,t){const n=await this.$http.executePost("/mentorship/addMentee",{cycleId:this.selectedCycle.id,userInput:this.menteeInput,mode:this.mode,mentorId:t},e);this.$http.isError(n)||(this.$store.dispatch("updateToastMessages",{message:`Added "${this.menteeInput}"`,type:"info"}),this.$store.commit("mentorship/updateCycle",n),this.menteeInput=null,this.editingMentorId="")},async removeParticipant(e,t){const n=await this.$http.executePost("/mentorship/removeParticipant",{cycleId:this.selectedCycle.id,userId:t,mode:this.mode},e);this.$http.isError(n)||(this.$store.dispatch("updateToastMessages",{message:"Removed user",type:"info"}),this.$store.commit("mentorship/updateCycle",n),this.confirmDeleteMentee="",this.confirmDeleteMentor="")},async togglePhase(e,t,n){this.phaseEdit=!0;const a=await this.$http.executePost("/mentorship/togglePhase",{cycleId:this.selectedCycle.id,userId:e.id,mode:this.mode,phaseNum:t,mentorId:n});this.$http.isError(a)||(this.$store.dispatch("updateToastMessages",{message:`Toggled phase ${t} for ${e.username}`,type:"info"}),this.$store.commit("mentorship/updateCycle",a)),this.phaseEdit=!1}}});const S=e=>(V("data-v-3d41bd04"),e=e(),B(),e),me={class:"col-sm-3"},he={key:0,class:"text-secondary"},ye=["onClick"],fe=S(()=>s("i",{class:"fas fa-plus"},null,-1)),$e=[fe],ge={key:1},_e=["onClick"],ve=S(()=>s("i",{class:"fas fa-minus"},null,-1)),Ce=[ve],be=["onClick"],Ie={key:2,class:"small"},ke=["onClick"],Me={key:0,class:"text-secondary"},we=["onClick"],De=S(()=>s("i",{class:"fas fa-minus"},null,-1)),Ue=[De],Pe=["onClick"],Se={key:3,class:"small"},Ee=["onClick"],Te={key:3,class:"input-group"},Ae=["onKeyup"],Ne={class:"input-group-append"},Ve=["onClick"],Be=S(()=>s("i",{class:"fas fa-plus fa-xs"},null,-1)),Le=[Be],Ke={class:"input-group mb-3"},Re={class:"input-group-append"},Ge=S(()=>s("i",{class:"fas fa-plus fa-xs"},null,-1)),ze=[Ge];function Fe(e,t,n,a,m,y){const i=g("user-link"),o=L("bs-tooltip");return r(),l("div",me,[s("h5",null,h(e.title),1),s("ol",null,[(r(!0),l(b,null,I(e.modeMentors,d=>(r(),l("li",{key:d.id+e.mode},[c(i,{user:d},null,8,["user"]),e.involvedInAllPhases(d)?v("",!0):f((r(),l("span",he,[_("*")])),[[o,"skips phases"]]),s("a",{href:"#",class:"text-success ms-1 small",onClick:p(u=>e.editingMentorId=d.id,["prevent"])},$e,8,ye),e.findMentees(d.id).length?v("",!0):(r(),l("span",ge,[e.confirmDeleteMentor!=d.id?(r(),l("a",{key:0,href:"#",class:"text-danger ms-1 small",onClick:p(u=>e.confirmDeleteMentor=d.id,["prevent"])},Ce,8,_e)):(r(),l("a",{key:1,class:"text-danger",href:"#",onClick:p(u=>e.removeParticipant(u,d.id),["prevent"])}," confirm ",8,be))])),e.showPhases?(r(),l("span",Ie,[(r(),l(b,null,I(3,u=>s("a",{key:u,href:"#",class:D(e.phaseEdit?"fake-button-disable":""),onClick:p(C=>e.togglePhase(d,u,null),["prevent"])},[s("span",{class:D([e.isPhaseParticipant(d,u,d.id)?"":"text-danger","ms-1"])},"P"+h(u),3)],10,ke)),64))])):v("",!0),s("ul",null,[(r(!0),l(b,null,I(e.findMentees(d.id),u=>(r(),l("li",{key:u.id+e.mode,class:"small"},[c(i,{user:u},null,8,["user"]),e.involvedInAllPhases(u)?v("",!0):f((r(),l("span",Me,[_("*")])),[[o,"skips phases"]]),e.confirmDeleteMentee!=u.id?(r(),l("a",{key:1,href:"#",class:"text-danger ms-1 small",onClick:p(C=>e.confirmDeleteMentee=u.id,["prevent"])},Ue,8,we)):(r(),l("a",{key:2,class:"text-danger",href:"#",onClick:p(C=>e.removeParticipant(C,u.id),["prevent"])}," confirm ",8,Pe)),e.showPhases?(r(),l("span",Se,[(r(),l(b,null,I(3,C=>s("a",{key:C,href:"#",class:D(e.phaseEdit?"fake-button-disable":""),onClick:p(A=>e.togglePhase(u,C,d.id),["prevent"])},[s("span",{class:D([e.isPhaseParticipant(u,C,d.id)?"":"text-danger","ms-1"])},"P"+h(C),3)],10,Ee)),64))])):v("",!0)]))),128))]),e.editingMentorId==d.id?(r(),l("div",Te,[f(s("input",{"onUpdate:modelValue":t[0]||(t[0]=u=>e.menteeInput=u),class:"form-control form-control-sm ms-2",autocomplete:"off",placeholder:"new mentee username/osuId...",onKeyup:T(u=>e.addMentee(u,d.id),["enter"])},null,40,Ae),[[$,e.menteeInput]]),s("div",Ne,[s("button",{class:"btn btn-primary",href:"#",onClick:p(u=>e.addMentee(u,d.id),["prevent"])},Le,8,Ve)])])):v("",!0)]))),128))]),s("div",Ke,[f(s("input",{"onUpdate:modelValue":t[1]||(t[1]=d=>e.mentorInput=d),class:"form-control form-control-sm",autocomplete:"off",placeholder:"new mentor username/osuId...",onKeyup:t[2]||(t[2]=T(d=>e.addMentor(d),["enter"]))},null,544),[[$,e.mentorInput]]),s("div",Re,[s("button",{class:"btn btn-primary",href:"#",onClick:t[3]||(t[3]=p(d=>e.addMentor(d),["prevent"]))},ze)])])])}const je=w(pe,[["render",Fe],["__scopeId","data-v-3d41bd04"]]),qe=M({name:"Participants",components:{ParticipantList:je},data(){return{cycleId:"",showCycleInputs:!1,cycleNameInput:null,cycleNumberInput:null,cycleUrlInput:null,cycleStartDateInput:new Date,cycleEndDateInput:new Date}},computed:{...k(["loggedInUser"]),...k("mentorship",["showPhases"]),...P("mentorship",["allCycles","selectedCycle"])},watch:{cycleId(){this.$store.commit("mentorship/setSelectedCycleId",this.cycleId),this.cycleNameInput=this.selectedCycle.name,this.cycleNumberInput=this.selectedCycle.number,this.cycleUrlInput=this.selectedCycle.url,this.cycleStartDateInput=new Date(this.selectedCycle.startDate),this.cycleEndDateInput=new Date(this.selectedCycle.endDate)}},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",U)},methods:{toggleShowPhases(){this.$store.commit("mentorship/toggleShowPhases")},async updateCycleName(e){const t=await this.$http.executePost("/mentorship/updateCycleName",{cycleId:this.selectedCycle.id,name:this.cycleNameInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle name",type:"info"}),this.$store.commit("mentorship/updateCycle",t))},async updateCycleNumber(e){const t=await this.$http.executePost("/mentorship/updateCycleNumber",{cycleId:this.selectedCycle.id,number:this.cycleNumberInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle number",type:"info"}),this.$store.commit("mentorship/updateCycle",t))},async updateCycleUrl(e){const t=await this.$http.executePost("/mentorship/updateCycleUrl",{cycleId:this.selectedCycle.id,url:this.cycleUrlInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle url",type:"info"}),this.$store.commit("mentorship/updateCycle",t))},async updateCycleStartDate(e){const t=await this.$http.executePost("/mentorship/updateCycleStartDate",{cycleId:this.selectedCycle.id,startDate:this.cycleStartDateInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle start date",type:"info"}),this.$store.commit("mentorship/updateCycle",t))},async updateCycleEndDate(e){const t=await this.$http.executePost("/mentorship/updateCycleEndDate",{cycleId:this.selectedCycle.id,endDate:this.cycleEndDateInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle end date",type:"info"}),this.$store.commit("mentorship/updateCycle",t))}}}),He={class:"container card card-body py-3 mb-2"},Je={class:"row"},Oe={class:"col-sm-6 mb-2"},Qe=s("option",{value:"",selected:"",disabled:""}," Select a cycle ",-1),We=["value"],Xe={key:0},Ye=s("hr",null,null,-1),Ze={key:0,class:"mb-4"},xe={class:"row"},et=s("div",{class:"col-sm-2"}," Cycle name: ",-1),tt={class:"col-sm-4 mb-2"},st={class:"input-group"},ot={class:"input-group-append"},nt={class:"row"},it=s("div",{class:"col-sm-2"}," Cycle number: ",-1),rt={class:"col-sm-4 mb-2"},lt={class:"input-group"},at={class:"input-group-append"},dt={class:"row"},ct=s("div",{class:"col-sm-2"}," Cycle url: ",-1),ut={class:"col-sm-4 mb-2"},pt={class:"input-group"},mt={class:"input-group-append"},ht={class:"row"},yt=s("div",{class:"col-sm-2"}," Cycle start date: ",-1),ft={class:"col-sm-4 mb-2"},$t={class:"input-group"},gt={class:"input-group-append"},_t={class:"row"},vt=s("div",{class:"col-sm-2"}," Cycle end date: ",-1),Ct={class:"col-sm-4 mb-2"},bt={class:"input-group"},It={class:"input-group-append"},kt={key:1},Mt={key:0,class:"fas fa-edit"},wt={class:"text-secondary small"},Dt={class:"row"};function Ut(e,t,n,a,m,y){const i=g("participant-list");return r(),l("div",null,[s("div",He,[s("div",Je,[s("div",Oe,[f(s("select",{"onUpdate:modelValue":t[0]||(t[0]=o=>e.cycleId=o),class:"form-select form-select d-inline"},[Qe,(r(!0),l(b,null,I(e.allCycles,o=>(r(),l("option",{key:o.id,value:o.id},h(o.number)+" - "+h(o.name),9,We))),128))],512),[[N,e.cycleId]])])]),e.selectedCycle?(r(),l("div",Xe,[Ye,e.showCycleInputs?(r(),l("div",Ze,[s("div",xe,[et,s("div",tt,[s("div",st,[f(s("input",{"onUpdate:modelValue":t[1]||(t[1]=o=>e.cycleNameInput=o),class:"form-control form-control-sm",autocomplete:"off",placeholder:"cycle name..."},null,512),[[$,e.cycleNameInput]]),s("div",ot,[s("button",{class:"btn btn-primary",href:"#",onClick:t[2]||(t[2]=p(o=>e.updateCycleName(o),["prevent"]))}," save ")])])])]),s("div",nt,[it,s("div",rt,[s("div",lt,[f(s("input",{"onUpdate:modelValue":t[3]||(t[3]=o=>e.cycleNumberInput=o),class:"form-control form-control-sm",autocomplete:"off",type:"number",placeholder:"cycle number..."},null,512),[[$,e.cycleNumberInput,void 0,{number:!0}]]),s("div",at,[s("button",{class:"btn btn-primary",href:"#",onClick:t[4]||(t[4]=p(o=>e.updateCycleNumber(o),["prevent"]))}," save ")])])])]),s("div",dt,[ct,s("div",ut,[s("div",pt,[f(s("input",{"onUpdate:modelValue":t[5]||(t[5]=o=>e.cycleUrlInput=o),class:"form-control form-control-sm",autocomplete:"off",placeholder:"cycle url..."},null,512),[[$,e.cycleUrlInput]]),s("div",mt,[s("button",{class:"btn btn-primary",href:"#",onClick:t[6]||(t[6]=p(o=>e.updateCycleUrl(o),["prevent"]))}," save ")])])])]),s("div",ht,[yt,s("div",ft,[s("div",$t,[f(s("input",{"onUpdate:modelValue":t[7]||(t[7]=o=>e.cycleStartDateInput=o),class:"form-control form-control-sm",type:"date",placeholder:"cycle start date..."},null,512),[[$,e.cycleStartDateInput]]),s("div",gt,[s("button",{class:"btn btn-primary",href:"#",onClick:t[8]||(t[8]=p(o=>e.updateCycleStartDate(o),["prevent"]))}," save ")])])])]),s("div",_t,[vt,s("div",Ct,[s("div",bt,[f(s("input",{"onUpdate:modelValue":t[9]||(t[9]=o=>e.cycleEndDateInput=o),class:"form-control form-control-sm",type:"date",placeholder:"cycle end date..."},null,512),[[$,e.cycleEndDateInput]]),s("div",It,[s("button",{class:"btn btn-primary",href:"#",onClick:t[10]||(t[10]=p(o=>e.updateCycleEndDate(o),["prevent"]))}," save ")])])])]),s("a",{href:"#",onClick:t[11]||(t[11]=p(o=>e.showCycleInputs=!e.showCycleInputs,["prevent"]))}," stop editing (close without saving) ")])):(r(),l("h4",kt,[_(h(e.selectedCycle.name)+" ",1),s("a",{href:"#",onClick:t[12]||(t[12]=p(o=>e.showCycleInputs=!e.showCycleInputs,["prevent"]))},[_(h(e.showCycleInputs?"close":"")+" ",1),e.showCycleInputs?v("",!0):(r(),l("i",Mt))])])),s("h5",wt,h(e.selectedCycle.startDate.slice(0,10))+" - "+h(e.selectedCycle.endDate.slice(0,10)),1),s("button",{class:"btn btn-sm btn-outline-info mb-2",onClick:t[13]||(t[13]=o=>e.toggleShowPhases())},h(e.showPhases?"Hide":"Show")+" phases ",1),s("div",null,[s("div",Dt,[c(i,{mode:"osu"}),c(i,{mode:"taiko"}),c(i,{mode:"catch"}),c(i,{mode:"mania"}),c(i,{mode:"modding"}),c(i,{mode:"graduation"}),c(i,{mode:"storyboard"})])])])):v("",!0)])])}const Pt=w(qe,[["render",Ut]]),St=M({name:"CycleList",props:{mode:{type:String,default:""},group:{type:String,default:""}},computed:{...k("mentorship",["selectedUser"]),modeMentorships(){return this.selectedUser.mentorships?this.selectedUser.mentorships.filter(e=>{if(e.group==this.group&&e.mode==this.mode)return!0}):[]},mentorshipsToPhases(){if(this.modeMentorships.length){let e=0;for(const t of this.modeMentorships)t.phases.length&&(e+=t.phases.length/3);return Math.round(e*100)/100}return 0},modeDuration(){return this.calculateDuration(this.modeMentorships)},title(){return this.mode=="modding"||this.mode=="graduation"||this.mode=="storyboard"?this.mode:this.mode=="osu"?"osu!":"osu!"+this.mode}},methods:{calculateDuration(e){let t=0;for(const n of e)if(new Date>new Date(n.cycle.endDate)){const a=new Date(n.cycle.endDate).getTime()-new Date(n.cycle.startDate).getTime(),m=Math.round(a*(n.phases.length/3)/(1e3*60*60*24));t+=m}return t},findRelevantMentees(e){return this.selectedUser.mentees.filter(t=>{for(const n of t.mentorships)if(n.cycle.toString()==e&&n.group=="mentee"&&n.mode==this.mode&&n.mentor.toString()==this.selectedUser.id)return!0})}}}),Et={class:"col-sm-3"},Tt={class:"text-center"},At=["href"],Nt={class:"small text-secondary"},Vt={key:0},Bt={class:"small text-secondary"},Lt={key:1};function Kt(e,t,n,a,m,y){const i=g("user-link");return r(),l("div",Et,[s("div",Tt,[s("b",{class:D(e.modeMentorships.length>=4&&e.group=="mentee"?"text-danger":"")},h(e.title)+" "+h(e.group)+" cycles ("+h(e.mentorshipsToPhases)+")",3)]),s("ul",null,[(r(!0),l(b,null,I(e.modeMentorships,o=>(r(),l("li",{key:o.id+e.mode},[s("a",{href:o.cycle.url,target:"_blank"},h(o.cycle.number)+": "+h(o.cycle.name),9,At),s("span",Nt," ("+h(e.calculateDuration([o]))+" days) ",1),o.mentor?(r(),l("ul",Vt,[s("li",Bt,[_(" mentored by "),c(i,{user:o.mentor},null,8,["user"])])])):v("",!0),e.group=="mentor"&&e.findRelevantMentees(o.cycle.id).length?(r(),l("ul",Lt,[(r(!0),l(b,null,I(e.findRelevantMentees(o.cycle.id),d=>(r(),l("li",{key:d.id+e.mode+o.cycle.id,class:"small text-secondary"},[_(" mentor of "),c(i,{user:d},null,8,["user"])]))),128))])):v("",!0)]))),128))])])}const Rt=w(St,[["render",Kt]]),Gt=M({name:"UserDetails",components:{CycleList:Rt},data(){return{userInput:""}},computed:{...k("mentorship",["selectedUser"]),totalMentorDuration(){const t=this.selectedUser.mentorships.filter(y=>{if(y.group=="mentor")return!0}).reduce((y,i)=>(y.some(o=>o.cycle.id===i.cycle.id)||y.push(i),y),[]),n=this.calculateDuration(t);let a=Math.floor(n/365),m=Math.round(n%365);return a>0?`${a} ${a==1?"year":"years"} and ${m} days`:`${m} days`},totalMenteeDuration(){const t=this.selectedUser.mentorships.filter(y=>{if(y.group=="mentee")return!0}).reduce((y,i)=>(y.some(o=>o.cycle.id===i.cycle.id)||y.push(i),y),[]),n=this.calculateDuration(t);let a=Math.floor(n/365),m=Math.round(n%365);return a>0?`${a} ${a==1?"year":"years"}, ${m} days`:`${m} days`}},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",U)},methods:{async searchUser(e){const t=await this.$http.executeGet("/mentorship/searchUser/"+this.userInput,e);this.$http.isError(t)||this.$store.commit("mentorship/setSelectedUser",t)},calculateDuration(e){let t=0;for(const n of e)if(new Date>new Date(n.cycle.endDate)){const a=new Date(n.cycle.endDate).getTime()-new Date(n.cycle.startDate).getTime(),m=Math.round(a*(n.phases.length/3)/(1e3*60*60*24));t+=m}return t}}}),zt={class:"container card card-body py-3"},Ft=s("h5",null,"User Details",-1),jt=s("div",{class:"text-secondary mb-2"}," View a user's mentorship history ",-1),qt={class:"input-group w-25"},Ht={class:"input-group-append"},Jt=s("i",{class:"fas fa-search fa-xs"},null,-1),Ot=[Jt],Qt={key:0},Wt={class:"mt-2"},Xt={class:"row mt-2"},Yt={class:"row mt-2"};function Zt(e,t,n,a,m,y){const i=g("cycle-list");return r(),l("div",null,[s("div",zt,[Ft,jt,s("div",qt,[f(s("input",{"onUpdate:modelValue":t[0]||(t[0]=o=>e.userInput=o),class:"form-control form-control-sm",autocomplete:"off",placeholder:"username/osuId...",onKeyup:t[1]||(t[1]=T(o=>e.searchUser(o),["enter"]))},null,544),[[$,e.userInput]]),s("div",Ht,[s("button",{class:"btn btn-primary",href:"#",onClick:t[2]||(t[2]=p(o=>e.searchUser(o),["prevent"]))},Ot)])]),e.selectedUser?(r(),l("div",Qt,[s("div",Wt,[_(" Mentor for "),s("b",null,h(e.totalMentorDuration),1),_(" across all cycles and game modes ")]),s("div",Xt,[c(i,{mode:"osu",group:"mentor"}),c(i,{mode:"taiko",group:"mentor"}),c(i,{mode:"catch",group:"mentor"}),c(i,{mode:"mania",group:"mentor"}),c(i,{mode:"modding",group:"mentor"}),c(i,{mode:"graduation",group:"mentor"}),c(i,{mode:"storyboard",group:"mentor"})]),s("div",null,[_(" Mentee for "),s("b",null,h(e.totalMenteeDuration),1),_(" across all cycles and game modes ")]),s("div",Yt,[c(i,{mode:"osu",group:"mentee"}),c(i,{mode:"taiko",group:"mentee"}),c(i,{mode:"catch",group:"mentee"}),c(i,{mode:"mania",group:"mentee"}),c(i,{mode:"modding",group:"mentee"}),c(i,{mode:"graduation",group:"mentee"}),c(i,{mode:"storyboard",group:"mentee"})])])):v("",!0)])])}const xt=w(Gt,[["render",Zt]]),es=M({name:"TenureBadges",data(){return{clicked:!1}},computed:{...k(["loggedInUser"]),...P("mentorship",["badgeUsers"])},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",U)},methods:{async loadTenureBadges(e){const t=await this.$http.executeGet("/mentorship/loadTenureBadges",e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"loaded",type:"info"}),console.log(t.badgeUsers),this.$store.commit("mentorship/setBadgeUsers",t.users))},async editBadgeValue(e,t){this.clicked=!0;const n=await this.$http.executePost("/mentorship/editBadgeValue",{userId:e,value:t});this.$http.isError(n)||(await this.loadTenureBadges(null),this.$store.dispatch("updateToastMessages",{message:"updated",type:"info"})),this.clicked=!1}}});const E=e=>(V("data-v-94498c36"),e=e(),B(),e),ts={class:"container card card-body py-3 mt-2"},ss=E(()=>s("h5",null,"Tenure Badges",-1)),os={key:1},ns=E(()=>s("span",{class:"text-secondary"},"Badge:",-1)),is=["onClick"],rs=E(()=>s("i",{class:"fas fa-plus ms-1 text-success"},null,-1)),ls=[rs],as=["onClick"],ds=E(()=>s("i",{class:"fas fa-minus ms-1 text-danger"},null,-1)),cs=[ds],us=E(()=>s("span",{class:"text-secondary"},"Actual tenure:",-1));function ps(e,t,n,a,m,y){const i=g("user-link");return r(),l("div",null,[s("div",ts,[ss,e.badgeUsers.length?(r(),l("ul",os,[(r(!0),l(b,null,I(e.badgeUsers,o=>(r(),l("li",{key:o.id},[c(i,{user:o},null,8,["user"]),s("ul",null,[s("li",null,[ns,_(),s("b",null,h(o.mentorshipBadge),1),s("a",{href:"#",class:D(e.clicked?"fake-button-disable":""),onClick:p(d=>e.editBadgeValue(o._id,!0),["prevent"])},ls,10,is),s("a",{href:"#",class:D(e.clicked?"fake-button-disable":""),onClick:p(d=>e.editBadgeValue(o._id,!1),["prevent"])},cs,10,as)]),s("li",null,[us,_(),s("b",null,h(o.actualTenure),1)])])]))),128))])):(r(),l("button",{key:0,class:"btn btn-primary",href:"#",onClick:t[0]||(t[0]=p(o=>e.loadTenureBadges(o,null),["prevent"]))}," Load badges "))])])}const ms=w(es,[["render",ps],["__scopeId","data-v-94498c36"]]),hs=M({name:"MentorshipPage",components:{Administrators:X,Cycles:ue,Participants:Pt,UserDetails:xt,AddUserManually:K,TenureBadges:ms},data(){return{userInput:null,confirmDelete:null}},computed:{...k(["loggedInUser"]),...P("mentorship",["allCycles"])},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",U)},async created(){const e=await this.$http.initialRequest("/mentorship/query");this.$http.isError(e)||(this.$store.commit("mentorship/setAdmins",e.admins),this.$store.commit("mentorship/setCycles",e.cycles))},methods:{}}),ys=s("hr",null,null,-1);function fs(e,t,n,a,m,y){const i=g("participants"),o=g("user-details"),d=g("cycles"),u=g("administrators"),C=g("add-user-manually"),A=g("tenure-badges");return r(),l("div",null,[c(i),c(o),ys,c(d),c(u),c(C),c(A)])}const _s=w(hs,[["render",fs]]);export{_s as default};

import{d as $,m as D,A as I,_ as j,o as r,c as B,w as y,j as b,t as u,a as n,e as a,b as _,f as v,y as m,p as S,F as f,r as C,k as p,i as k,n as T}from"./index-6a07b58c.js";import{C as M}from"./ContestCard-a817ecd9.js";import{M as E}from"./ModalDialog-c8d9e759.js";const J=$({name:"EditingCriteriaModal",components:{ModalDialog:E},data(){return{editingScore:0,editingComment:""}},computed:{...D({selectedContestId:t=>t.judging.selectedContestId,judgingDone:t=>t.judging.judgingDone}),...I(["editingSubmission","editingCriteria"])},watch:{editingSubmission(){this.getUserInput()},editingCriteria(){this.getUserInput()}},methods:{getUserInput(){if(this.editingSubmission){const t=this.getJudgingToCriterias(this.editingSubmission.id,this.editingCriteria.id);t?(this.editingScore=t.score,this.editingComment=t.comment):(this.editingScore=0,this.editingComment="")}},getJudgingToCriterias(t,e){const s=this.judgingDone.find(o=>o.submission.id===t);if(!s)return null;const i=s.judgingScores.find(o=>o.criteria.id===e);return i||null},async save(t){var s,i;const e=await this.$http.executePost("/contests/judging/save",{submissionId:(s=this.editingSubmission)==null?void 0:s.id,criteriaId:(i=this.editingCriteria)==null?void 0:i.id,score:this.editingScore,comment:this.editingComment},t);this.$http.isError(e)||(this.$store.commit("setJudgingDone",e.judgingDone),this.$store.dispatch("updateToastMessages",{message:e.success,type:"info"}))},closeModal(){var t;(t=document.getElementById("close-button"))==null||t.click()}}}),V={class:"text-capitalize"},U={key:0,class:"mb-3"},N=n("label",{class:"form-label",for:"score"},"Score",-1),P=["max"],q={key:1,class:"mb-3"},F=n("label",{class:"form-label",for:"comment"}," Comment ",-1),R=n("div",{id:"close-button","data-bs-dismiss":"modal"},null,-1);function z(t,e,s,i,o,c){const l=S("modal-dialog");return r(),B(l,{id:"editing-judging-modal","data-bs-backdrop":"static","data-bs-keyboard":"false",loaded:!!t.editingSubmission},{header:y(()=>[b(u(t.editingSubmission.name)+": ",1),n("span",V,u(t.editingCriteria.name),1)]),default:y(()=>[t.editingCriteria.name!="comments"?(r(),a("div",U,[N,_(n("input",{id:"score","onUpdate:modelValue":e[0]||(e[0]=g=>t.editingScore=g),type:"number",step:"1",min:"0",max:t.editingCriteria.maxScore,class:"form-control"},null,8,P),[[v,t.editingScore]])])):(r(),a("div",q,[F,_(n("textarea",{id:"comment","onUpdate:modelValue":e[1]||(e[1]=g=>t.editingComment=g),maxlength:"3000",rows:"4",class:"form-control"},null,512),[[v,t.editingComment]])]))]),footer:y(()=>[n("button",{type:"button",class:"btn btn-sm btn-outline-secondary",onClick:e[2]||(e[2]=m(g=>t.closeModal(),["prevent"]))}," Close "),n("button",{type:"button",class:"btn btn-sm btn-outline-primary",onClick:e[3]||(e[3]=m(g=>t.save(g),["prevent"]))}," Save changes "),R]),_:1},8,["loaded"])}const A=j(J,[["render",z]]),L=$({name:"JudgingInstructions"}),O={class:"mb-2"},G=n("ul",null,[n("li",null,"Set scores for every category. Talk to the contest host about what each category means!"),n("li",null,"DO NOT discuss your scores with anyone else, including other judges.")],-1),Y=[G];function H(t,e,s,i,o,c){return r(),a("div",O,Y)}const K=j(L,[["render",H]]),Q={state:{contests:[],selectedContestId:null,judgingDone:[],editingSubmissionId:null,editingCriteriaId:null},mutations:{setContests(t,e){t.contests=e},setSelectedContestId(t,e){t.selectedContestId=e},setJudgingDone(t,e){t.judgingDone=e},setEditingSubmissionId(t,e){t.editingSubmissionId=e},setEditingCriteriaId(t,e){t.editingCriteriaId=e}},getters:{selectedContest:t=>t.contests.find(e=>e.id===t.selectedContestId),editingSubmission:(t,e)=>{var s;return(s=e.selectedContest)==null?void 0:s.submissions.find(i=>i.id===t.editingSubmissionId)},editingCriteria:(t,e)=>{var s;return(s=e.selectedContest)==null?void 0:s.criterias.find(i=>i.id===t.editingCriteriaId)}}},W=Q,X=$({name:"JudgingPage",components:{EditingCriteriaModal:A,ContestCard:M,JudgingInstructions:K},data(){return{sortBy:"name",sortByCriteria:"",sortDesc:!1,loadedSpecificContest:!1}},computed:{...D({contests:t=>t.judging.contests,judgingDone:t=>t.judging.judgingDone}),...I(["selectedContest"]),filteredSubmissions(){const t=[];for(let s=0;s<this.selectedContest.submissions.length;s++)this.selectedContest.submissions[s].screenings.reduce((c,l)=>l.vote?this.selectedContest.screeningBonus?c+l.vote+1:c+l.vote:c,0)>=this.selectedContest.judgingThreshold&&t.push(s);const e=[];for(const s of t)e.push(this.selectedContest.submissions[s]);return e},sortedSubmissions(){const t=this.filteredSubmissions;return t?(this.sortBy==="name"?t.sort((e,s)=>{var c,l;const i=(c=e.name)==null?void 0:c.toUpperCase(),o=(l=s.name)==null?void 0:l.toUpperCase();return i<o?this.sortDesc?-1:1:i>o?this.sortDesc?1:-1:0}):this.sortBy==="total"?t.sort((e,s)=>{const i=this.getTotalScore(e.id),o=this.getTotalScore(s.id);return this.sortDesc?i-o:o-i}):this.sortBy==="criteria"?t.sort((e,s)=>{const i=this.getScore(e.id,this.sortByCriteria),o=this.getScore(s.id,this.sortByCriteria);return this.sortDesc?i-o:o-i}):this.sortBy==="completed"&&t.sort((e,s)=>{const i=this.isCompleted(e.id),o=this.isCompleted(s.id);return i===o?0:this.sortDesc?i?1:-1:i?-1:1}),t):[]},sortedCriteria(){const t=[...this.selectedContest.criterias];return t.sort((e,s)=>e.maxScore<s.maxScore?1:e.maxScore>s.maxScore?-1:0),t},maxPossibleScore(){return this.selectedContest.criterias.reduce((t,e)=>e.maxScore+t,0)}},beforeCreate(){this.$store.hasModule("judging")||this.$store.registerModule("judging",W)},unmounted(){this.$store.hasModule("judging")&&this.$store.unregisterModule("judging")},async created(){await this.loadContests()},methods:{async loadContests(){const t=this.$route.query.contest;if(t&&!this.contests.length){const e=await this.$http.initialRequest(`/contests/judging/searchContest/${t}`);this.$http.isError(e)||(this.$store.commit("setContests",[e.contest]),this.$store.commit("setSelectedContestId",t),this.$store.commit("setJudgingDone",e.judgingDone),this.loadedSpecificContest=!0)}else{this.$router.replace("/contests/judging");const e=await this.$http.initialRequest("/contests/judging/relevantInfo");this.$http.isError(e)||(this.$store.commit("setContests",e.contests),this.$store.commit("setSelectedContestId",null),this.$store.commit("setJudgingDone",e.judgingDone),this.loadedSpecificContest=!1)}},selectForEditing(t,e){this.$store.commit("setEditingSubmissionId",t),this.$store.commit("setEditingCriteriaId",e)},getJudgingToCriterias(t,e){const s=this.judgingDone.find(o=>o.submission.id===t);if(!s)return null;const i=s.judgingScores.find(o=>o.criteria.id===e);return i||null},getScore(t,e){const s=this.getJudgingToCriterias(t,e);return s?s.score:0},getTotalScore(t){const e=this.judgingDone.find(s=>s.submission.id===t);return e?e.judgingScores.reduce((s,i)=>i.score+s,0):0},isCompleted(t){const e=this.judgingDone.find(s=>s.submission.id===t);return e?e.judgingScores.length===this.selectedContest.criterias.length:!1},sortSubmissionsBy(t,e){this.sortBy=t,this.sortDesc=!this.sortDesc,t==="criteria"&&e&&(this.sortByCriteria=e)},async loadMore(){await this.loadContests()},getComment(t){const e=this.judgingDone.find(i=>i.submission.id===t);if(!e)return"...";let s="...";for(const i of e.judgingScores)i.comment&&i.comment.length&&(s=i.comment.length>10?i.comment.slice(0,10)+"...":i.comment);return s}}}),Z={class:"container card card-body py-1"},x={key:0,class:"row"},tt={key:0,class:"col-sm-4 my-2"},et={key:1},st=n("hr",null,null,-1),it={class:"card"},nt={class:"my-2"},ot=["href"],rt={class:"mb-2"},dt=n("i",{class:"fas fa-angle-down"},null,-1),at={class:"card-body p-0 mt-2"},lt={class:"table table-responsive-sm mb-0"},ct={class:"text-start"},ut=["onClick"],gt={class:"text-start"},mt=["onClick"],ht={key:0},ft={key:1},Ct=n("i",{class:"ms-1 fas fa-edit"},null,-1),pt={class:"text-center"},bt={key:1,class:"text-center my-4"},St=n("a",{href:"/contests/listing"},"contests listing",-1);function yt(t,e,s,i,o,c){const l=S("contest-card"),g=S("judging-instructions"),w=S("editing-criteria-modal");return r(),a("div",Z,[t.contests&&t.contests.length?(r(),a("div",x,[(r(!0),a(f,null,C(t.contests,d=>(r(),B(l,{key:d.id,class:"col-sm-4 my-2",contest:d,route:"judging"},null,8,["contest"]))),128)),t.loadedSpecificContest?(r(),a("div",tt,[n("button",{class:"btn w-100 btn-info h-100",type:"button",onClick:e[0]||(e[0]=d=>t.loadMore())}," Load other contests ")])):p("",!0),t.selectedContest?(r(),a("div",et,[st,n("div",it,[n("h4",nt,u(t.selectedContest.name),1),n("h5",null,[n("a",{href:t.selectedContest.download,target:"_blank"}," Download all submissions ",8,ot)]),n("div",rt,[n("a",{href:"#judgingInstructions","data-bs-toggle":"collapse",onClick:e[1]||(e[1]=m(()=>{},["prevent"]))},[b(" See judging instructions "),dt])]),k(g,{id:"judgingInstructions",class:"collapse"}),n("div",at,[n("table",lt,[n("thead",null,[n("tr",null,[n("th",ct,[n("a",{href:"#",onClick:e[2]||(e[2]=m(d=>t.sortSubmissionsBy("name"),["prevent"]))}," Entry's Name ")]),(r(!0),a(f,null,C(t.sortedCriteria,d=>(r(),a("th",{key:d.id},[n("a",{href:"#",class:"text-start",onClick:m(h=>t.sortSubmissionsBy("criteria",d.id),["prevent"])},u(d.name),9,ut)]))),128)),n("th",null,[n("a",{href:"#",onClick:e[3]||(e[3]=m(d=>t.sortSubmissionsBy("total"),["prevent"]))}," Total ")]),n("th",null,[n("a",{href:"#",onClick:e[4]||(e[4]=m(d=>t.sortSubmissionsBy("completed"),["prevent"]))}," Completed ")])])]),n("tbody",null,[(r(!0),a(f,null,C(t.sortedSubmissions,d=>(r(),a("tr",{key:d.id},[n("td",gt,u(d.name),1),(r(!0),a(f,null,C(t.sortedCriteria,h=>(r(),a("td",{key:h.id,class:"text-start"},[n("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editing-judging-modal",onClick:m($t=>t.selectForEditing(d.id,h.id),["prevent"])},[h.name!="comments"?(r(),a("span",ht,u(t.getScore(d.id,h.id)+`/${h.maxScore}`),1)):(r(),a("span",ft,u(t.getComment(d.id)),1)),Ct],8,mt)]))),128)),n("td",null,u(t.getTotalScore(d.id))+"/"+u(t.maxPossibleScore),1),n("td",pt,[n("i",{class:T(["fa",t.isCompleted(d.id)?"fa-check text-success":"fa-times text-danger"])},null,2)])]))),128))])])])])])):p("",!0)])):p("",!0),t.contests.length?p("",!0):(r(),a("div",bt,[b(" You're not a judge for any ongoing contests! Return to the "),St,b(". ")])),k(w)])}const kt=j(X,[["render",yt]]);export{kt as default};

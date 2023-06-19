import{d as h,m as w,u as S,_ as p,o as n,e as i,F as f,r as _,n as C,l as y,a as t,q as v,t as I,b as V,A as N,k as $,i as m,K as L,c as b,h as M,w as T,T as F}from"./index-8c73bd06.js";import{C as q}from"./ContestCard-f4896567.js";var k=(e=>(e[e.First=5]="First",e[e.Second=4]="Second",e[e.Third=3]="Third",e[e.Fourth=2]="Fourth",e[e.Fifth=1]="Fifth",e[e.None=0]="None",e))(k||{});const E=h({name:"ScreeningVote",props:{submissionId:{type:String,required:!0},savedVote:{type:Number,default:0},screeningVoteCount:{type:Number,default:0}},computed:{...w({voteLoading:e=>e.screening.voteLoading}),...S(["usedVotes"])},methods:{async updateVote(e){this.$store.commit("setVoteLoading",!0),this.savedVote==e&&(e=k.None);const s=await this.$http.executePost("/contests/screening/updateSubmission/"+this.submissionId,{vote:e});this.$http.isError(s)||this.$store.commit("updateSubmission",s),this.$store.commit("setVoteLoading",!1)}}});const U=["disabled","onClick"];function B(e,s,r,d,a,c){return n(),i("div",null,[(n(!0),i(f,null,_(e.screeningVoteCount,o=>(n(),i("a",{key:o,class:C(["mx-1",{"disabled-star":e.usedVotes.includes(o)&&e.savedVote!=o||e.voteLoading}]),disabled:e.voteLoading,href:"#",onClick:y(l=>e.updateVote(o),["prevent"])},[t("i",{class:C(["fa-star fas",{"text-warning":e.usedVotes.includes(o)&&e.savedVote==o}])},null,2)],10,U))),128))])}const D=p(E,[["render",B],["__scopeId","data-v-c0766042"]]),O=h({name:"ScreeningNotes",props:{submissionId:{type:String,required:!0},savedComment:{type:String,default:""}},data(){return{showCommentInput:!1,newComment:this.savedComment}},methods:{cancelUpdate(){this.showCommentInput=!this.showCommentInput,this.newComment=this.savedComment},async updateComment(e){if(this.savedComment!=this.newComment){const s=await this.$http.executePost("/contests/screening/updateSubmission/"+this.submissionId,{comment:this.newComment.trim()},e);this.$http.isError(s)||(this.showCommentInput=!this.showCommentInput,this.$store.commit("updateSubmission",s))}else this.showCommentInput=!this.showCommentInput}}}),j={class:""},G=t("i",{class:"fas fa-edit"},null,-1),R=[G],z={key:1,class:"small text-white-50"},A={class:"text-end"};function K(e,s,r,d,a,c){return n(),i("div",j,[e.showCommentInput?v("",!0):(n(),i("a",{key:0,href:"#",onClick:s[0]||(s[0]=y(o=>e.showCommentInput=!e.showCommentInput,["prevent"]))},R)),e.showCommentInput?(n(),i(f,{key:2},[V(t("textarea",{"onUpdate:modelValue":s[1]||(s[1]=o=>e.newComment=o),class:"form-control form-control-sm",rows:"4",type:"text",placeholder:"map comments...",style:{overflow:"hidden","overflow-wrap":"break-word"},maxlength:"1000"},null,512),[[N,e.newComment,void 0,{trim:!0}]]),t("div",A,[t("button",{type:"button",class:"btn btn-sm btn-outline-info mt-1 mx-1",onClick:s[2]||(s[2]=o=>e.cancelUpdate())}," Cancel "),t("button",{type:"button",class:"btn btn-sm btn-outline-info mt-1 mx-1",onClick:s[3]||(s[3]=o=>e.updateComment(o))}," Save ")])],64)):(n(),i("span",z,I(e.newComment||"..."),1))])}const Y=p(O,[["render",K]]),H=h({name:"SubmissionCard",components:{ScreeningVote:D,ScreeningNotes:Y},props:{submission:{type:Object,required:!0},screeningVoteCount:{type:Number,default:0}},computed:{...w(["loggedInUser"]),relatedScreening(){return this.submission.screenings.find(e=>e.screener._id===this.loggedInUser.id)}}});const J={class:"col-sm-12 my-1"},Q={class:"card-body p-2"},W={class:"row"},X={class:"col-sm-6"},Z={class:"col-sm-6 text-end"},P={class:"row"},x={class:"col-sm"};function ee(e,s,r,d,a,c){const o=m("screening-vote"),l=m("screening-notes");return n(),i("div",J,[t("div",{class:C(["card",e.relatedScreening&&e.relatedScreening.vote?"bg-vote":"bg-dark"])},[t("div",Q,[t("div",W,[t("div",X,I(e.submission.name),1),t("div",Z,[$(o,{"submission-id":e.submission.id,"saved-vote":e.relatedScreening&&e.relatedScreening.vote,"screening-vote-count":e.screeningVoteCount},null,8,["submission-id","saved-vote","screening-vote-count"])])]),t("div",P,[t("div",x,[$(l,{"submission-id":e.submission.id,"saved-comment":e.relatedScreening&&e.relatedScreening.comment},null,8,["submission-id","saved-comment"])])])])],2)])}const se=p(H,[["render",ee],["__scopeId","data-v-469d1962"]]),te=h({name:"ScreeningInstructions"}),ne={class:"mb-2"},oe=L('<ul><li>Mark your personal <b>top 5</b> submissions with stars. If the contest has a theme/additional rules, consider those when making your choices.</li><li> Stars <i class="fa-star fas text-warning"></i> indicate the order of your top 5. The star on the <b>left is the lowest score</b>, while the star on the <b>right is the highest score</b>. </li><li>Comments will be seen by the map creator. Your name will be anonymous.</li><li>DO NOT discuss your choices with other screeners or outsiders until after the contest is concluded.</li><li>The overall highest scoring submissions will be included in the judging phase!</li></ul>',1),ie=[oe];function re(e,s,r,d,a,c){return n(),i("div",ne,ie)}const de=p(te,[["render",re]]),ae={state:{contests:[],selectedContestId:null,voteLoading:!1},mutations:{setContests(e,s){e.contests=s},setSelectedContestId(e,s){e.selectedContestId=s},setVoteLoading(e,s){e.voteLoading=s},updateSubmission(e,s){let r=-1;const d=e.contests.findIndex(a=>{if(r=a.submissions.findIndex(c=>c.id===s.id),r!==-1)return!0});d!==-1&&r!==-1&&(e.contests[d].submissions[r]=s)}},getters:{selectedContest:e=>e.contests.find(s=>s.id===e.selectedContestId),usedVotes:(e,s,r)=>{const d=s.selectedContest,a=[];return d.submissions.forEach(c=>{const o=c.screenings.find(l=>{var g;return l.screener.id===((g=r.loggedInUser)==null?void 0:g.id)});o&&a.push(o.vote)}),a}}},ce=ae,le=h({name:"ScreeningPage",components:{SubmissionCard:se,ContestCard:q,ScreeningInstructions:de},data(){return{loadedSpecificContest:!1}},computed:{...w({contests:e=>e.screening.contests}),...S(["selectedContest"])},beforeCreate(){this.$store.hasModule("screening")||this.$store.registerModule("screening",ce)},unmounted(){this.$store.hasModule("screening")&&this.$store.unregisterModule("screening")},async created(){await this.loadContests()},methods:{async loadContests(){const e=this.$route.query.contest;if(e&&!this.contests.length){const s=await this.$http.initialRequest(`/contests/screening/searchContest/${e}`);this.$http.isError(s)||(this.$store.commit("setContests",[s]),this.$store.commit("setSelectedContestId",e),this.loadedSpecificContest=!0)}else{this.$router.replace("/contests/screening");const s=await this.$http.initialRequest("/contests/screening/relevantInfo");this.$http.isError(s)||(this.$store.commit("setContests",s||[]),this.$store.commit("setSelectedContestId",null),this.loadedSpecificContest=!1)}},async loadMore(){await this.loadContests()}}}),ue={class:"container card card-body py-1"},me={key:0,class:"row"},he={key:0,class:"col-sm-4 my-2"},pe={key:1},ge=t("hr",null,null,-1),fe={class:"my-2"},be=["href"],_e={class:"mb-2"},Ce=t("i",{class:"fas fa-angle-down"},null,-1),ve={key:1,class:"ms-4"},$e={key:1,class:"text-center p-3"};function we(e,s,r,d,a,c){const o=m("contest-card"),l=m("screening-instructions"),g=m("submission-card");return n(),i("div",ue,[e.contests&&e.contests.length?(n(),i("div",me,[(n(!0),i(f,null,_(e.contests,u=>(n(),b(o,{key:u.id,class:"col-sm-4 my-2",contest:u,route:"screening"},null,8,["contest"]))),128)),e.loadedSpecificContest?(n(),i("div",he,[t("button",{class:"btn w-100 btn-info h-100",type:"button",onClick:s[0]||(s[0]=u=>e.loadMore())}," Load other contests ")])):v("",!0),e.selectedContest?(n(),i("div",pe,[ge,t("h4",fe,I(e.selectedContest.name),1),t("h5",null,[t("a",{href:e.selectedContest.download,target:"_blank"}," Download all submissions ",8,be)]),t("div",_e,[t("a",{href:"#screeningInstructions","data-bs-toggle":"collapse",onClick:s[1]||(s[1]=y(()=>{},["prevent"]))},[M(" See screening instructions "),Ce])]),$(l,{id:"screeningInstructions",class:"collapse"}),e.selectedContest.submissions.length?(n(),b(F,{key:0,name:"list",tag:"div",class:"row"},{default:T(()=>[(n(!0),i(f,null,_(e.selectedContest.submissions,u=>(n(),b(g,{key:u.id,submission:u,"screening-vote-count":e.selectedContest.screeningVoteCount},null,8,["submission","screening-vote-count"]))),128))]),_:1})):(n(),i("p",ve," No submissions... "))])):v("",!0)])):(n(),i("div",$e," No contests available for screening. "))])}const Se=p(le,[["render",we]]);export{Se as default};

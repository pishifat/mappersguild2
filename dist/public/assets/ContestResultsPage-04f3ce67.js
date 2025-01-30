import{d as S,a0 as V,m as k,_ as C,o,e as n,a as e,j as d,t as c,i as y,z,k as l,F as m,r as g,b as f,q as $,s as R,n as w,C as N,c as j}from"./index-4320389d.js";const T={state:{contest:null,submissions:[],submission:null},mutations:{setContest(s,t){s.contest=t},setSubmissions(s,t){s.submissions=t},setSubmission(s,t){s.submission=t}}},U=T,F=S({name:"SubmissionResult",components:{UserLink:V},computed:{...k({submission:s=>s.contestResults.submission,loggedInUser:s=>s.loggedInUser}),voteCount(){let s=0;return this.submission.screenings.forEach(t=>{isNaN(t.vote)||(s+=t.vote)}),s},emptyScreeningCount(){return this.submission.contest.screeners.length-this.submission.screenings.length},randomizedJudging(){let s=[...this.submission.judgings];return s=s.sort(()=>Math.random()-.5),s},randomizedScreening(){let s=[...this.submission.screenings];return s=s.sort(()=>Math.random()-.5),s}},methods:{findTotalJudgingPoints(s){let t=0;return s.forEach(i=>{t+=i.score}),t},findTotalCriteriaPoints(s){let t=0;return s.forEach(i=>{t+=i.criteria.maxScore}),t},findJudgeComment(s){let t="";return s.forEach(i=>{i.criteria.name=="comments"&&(t=i.comment)}),t},filteredAndSortedJudgingScores(s){s=s.filter(i=>i.criteria.name!="comments");const t=["musical representation","creativity","limitation","gameplay"];return[...s].sort(function(i,a){return t.indexOf(i.criteria.name)-t.indexOf(a.criteria.name)})}}}),J={key:0,class:"container p-3"},E=["href"],M=e("i",{class:"fa fa-arrow-left"},null,-1),P={key:0},I={key:1,class:"mt-2"},q=["href"],A=e("hr",null,null,-1),D={class:"mx-2"},B=e("h5",null," Screening results ",-1),O={key:0},X=e("p",{class:"ms-3"}," Comments are usually each screener's initial thoughts. They're not intended to be constructive feedback and many screeners use comments as notes for determining their top picks. ",-1),L={class:"ms-3"},G={key:0,class:"fas fa-check text-done"},Y={class:"ms-4 mb-2 small text-secondary",style:{"word-break":"break-word"}},H={class:"ms-3"},K=e("div",{class:"ms-4 mb-2 small text-secondary",style:{"word-break":"break-word"}}," [no comment] ",-1),Q={key:1,class:"ms-3"},W=e("hr",null,null,-1),Z={class:"mx-2"},x=e("h5",null," Judging results ",-1),ss={key:0},es={key:0,class:"ms-3"},ts={key:1,class:"ms-3"},os={class:"row ms-3"},ns={class:"col-sm-5"},is={class:"table table-sm table-responsive-sm"},rs=e("thead",null,[e("tr",null,[e("th",{class:"text-start"}," Category "),e("th",{class:"text-start"}," Score ")])],-1),cs={class:"text-start text-capitalize"},as={class:"text-start"},ls=e("td",{class:"text-start"}," TOTAL ",-1),us={class:"text-start"},ds={class:"col-sm-7 small"},hs={class:"text-secondary",style:{"white-space":"pre-line"}},ms={key:1,class:"ms-3"};function gs(s,t,i,a,u,v){const _=$("user-link"),h=R("bs-tooltip");return o(),n("div",null,[s.submission?(o(),n("div",J,[e("div",null,[e("h3",null,[e("a",{href:"/contests/results?contest="+s.submission.contest.id},[M,d(" "+c(s.submission.contest.name),1)],8,E)]),e("h4",null,[d(" Submission by "),y(_,{user:s.submission.creator},null,8,["user"])]),e("h5",null,' Anonymized as "'+c(s.submission.name)+'" ',1),s.loggedInUser&&s.loggedInUser.id==s.submission.creator.id?(o(),n("div",P,[e("a",{href:"#",onClick:t[0]||(t[0]=z(r=>s.$store.commit("setSubmission",null),["prevent"]))}," Your other contest submissions ")])):l("",!0),s.submission.contest.download?(o(),n("div",I,[e("div",null,[e("a",{href:s.submission.contest.download,target:"_blank"}," Download all submissions ",8,q)])])):l("",!0)]),A,e("div",D,[B,s.submission.screenings&&s.submission.screenings.length?(o(),n("div",O,[X,(o(!0),n(m,null,g(s.randomizedScreening,(r,b)=>(o(),n("div",{key:r.id},[e("div",null,[e("div",L,[d(" User "+c(b+1)+" ",1),r.vote?f((o(),n("i",G,null,512)),[[h,"user placed in top picks"]]):l("",!0)]),e("div",Y,c(r.comment?r.comment:"[no comment]"),1)])]))),128)),(o(!0),n(m,null,g(s.emptyScreeningCount,r=>(o(),n("div",{key:r},[e("div",null,[e("div",H," User "+c(s.submission.screenings.length+r),1),K])]))),128))])):(o(),n("div",Q," This contest skipped screening. "))]),W,e("div",Z,[x,s.submission.judgings&&s.submission.judgings.length?(o(),n("div",ss,[(o(!0),n(m,null,g(s.randomizedJudging,(r,b)=>(o(),n("div",{key:r.id},[e("div",null,[s.submission.contest.hasPublicJudges?(o(),n("div",es,[y(_,{user:r.judge},null,8,["user"])])):(o(),n("div",ts," User "+c(b+1),1)),e("div",os,[e("div",ns,[e("table",is,[rs,e("tbody",null,[(o(!0),n(m,null,g(s.filteredAndSortedJudgingScores(r.judgingScores),p=>(o(),n("tr",{key:p.id},[e("td",cs,c(p.criteria.name),1),e("td",as,c(p.score)+"/"+c(p.criteria.maxScore),1)]))),128)),e("tr",null,[ls,e("td",us,c(s.findTotalJudgingPoints(r.judgingScores))+"/"+c(s.findTotalCriteriaPoints(r.judgingScores)),1)])])])]),e("div",ds,[d(" Comment: "),e("span",hs,c(s.findJudgeComment(r.judgingScores)),1)])])])]))),128))])):(o(),n("div",ms," This entry did not receive enough screening votes to reach the judging stage. :( "))])])):l("",!0)])}const _s=C(F,[["render",gs]]),bs=S({name:"ContestResults",data(){return{usersScores:[]}},computed:{...k({contest:s=>s.contestResults.contest}),maxScore(){let s=0;for(const t of this.contest.criterias)s+=t.maxScore;return s*this.contest.judges.length},sortedSubmissions(){return this.contest.useRawScoring?[...this.contest.submissions].sort((s,t)=>{const i=this.judgeScore(s.judgings);return this.judgeScore(t.judgings)-i}):[...this.contest.submissions.filter(i=>i.judgings&&i.judgings.length)].sort((i,a)=>{const u=this.getFinalScore(i.id);return this.getFinalScore(a.id)-u}).concat([...this.contest.submissions.filter(i=>!i.judgings||i.judgings&&!i.judgings.length)])}},async created(){const s=await this.$http.executeGet(`/contests/listing/${this.contest.id}/getUsersScores`);this.$http.isError(s)||(this.usersScores=s.usersScores)},methods:{voteCount(s,t){let i=0;for(const a of s)a.vote&&!isNaN(a.vote)&&(t?i+=a.vote:i++);return i},judgeScore(s){let t=0;for(const i of s)for(const a of i.judgingScores)t+=a.score;return t},getFinalScore(s){const t=this.usersScores.find(i=>i.submissionId==s);return t?isNaN(t.standardizedFinalScore)?0:parseFloat(t.standardizedFinalScore.toFixed(4)):0}}}),ps={key:0,class:"container p-3"},fs=["href"],$s={key:1},vs=["href"],ys={class:"table table-sm"},Ss={scope:"col"},ks=e("th",{scope:"col"}," Creator ",-1),Cs={key:0,scope:"col"},ws={scope:"col"},js={key:1,scope:"col"},Rs={scope:"row"},Vs=["href"],zs=e("i",{class:"fa fa-arrow-right"},null,-1),Ns={scope:"row"},Ts={key:0},Us=e("i",{class:"fas fa-check text-done me-1"},null,-1),Fs=[Us],Js={key:0},Es={key:1},Ms={key:0},Ps={key:1};function Is(s,t,i,a,u,v){const _=$("user-link"),h=R("bs-tooltip");return o(),n("div",null,[s.contest?(o(),n("div",ps,[e("h4",null,[s.contest.url||s.contest.resultsUrl?(o(),n("a",{key:0,href:s.contest.resultsUrl?s.contest.resultsUrl:s.contest.url,target:"_blank"},c(s.contest.name)+" results ",9,fs)):(o(),n("span",$s,c(s.contest.name)+" results",1))]),e("div",null,[e("a",{href:s.contest.download,target:"_blank"}," Download all submissions ",8,vs)]),e("table",ys,[e("thead",null,[e("tr",null,[f((o(),n("th",Ss,[d(" Submission ")])),[[h,"anonymized name seen by screeners/judges"]]),ks,s.contest.judgingThreshold?f((o(),n("th",Cs,[d(" Screener votes ("+c(s.contest.screeners.length*s.contest.screeningVoteCount)+") ",1)])),[[h,`screeners sort entries in their ordered top ${s.contest.screeningVoteCount}. #1 adds ${s.contest.screeningVoteCount} points, #2 adds ${s.contest.screeningVoteCount-1} points, #3 adds ${s.contest.screeningVoteCount-2}, etc.`]]):l("",!0),e("th",ws," Raw scores ("+c(s.maxScore)+") ",1),s.contest.useRawScoring?l("",!0):f((o(),n("th",js,[d(" Standardized scores ")])),[[h,"judge X's final score = (judge X's raw score - judge X's average raw score) / judge X's standard deviation"]])])]),e("tbody",null,[(o(!0),n(m,null,g(s.sortedSubmissions,r=>(o(),n("tr",{key:r.id+"screen"},[e("td",Rs,[e("a",{href:"/contests/results?submission="+r.id},[d(c(r.name)+" ",1),zs],8,Vs)]),e("td",Ns,[y(_,{user:r.creator},null,8,["user"])]),s.contest.judgingThreshold?(o(),n("td",Ts,[(o(!0),n(m,null,g(s.voteCount(r.screenings),b=>(o(),n("span",{key:b},Fs))),128)),s.voteCount(r.screenings,!0)>0?(o(),n("span",Js," ("+c(s.voteCount(r.screenings,!0))+") ",1)):l("",!0)])):l("",!0),e("td",null,[e("span",{class:w(s.contest.useRawScoring&&s.judgeScore(r.judgings)>0?"text-done":"")},c(s.judgeScore(r.judgings)||"N/A"),3)]),s.contest.useRawScoring?l("",!0):(o(),n("td",Es,[e("span",{class:w(s.judgeScore(r.judgings)>0?"text-done":"")},[s.usersScores.length?(o(),n("div",Ps,c(s.getFinalScore(r.id)||"N/A"),1)):(o(),n("div",Ms,"calculating..."))],2)]))]))),128))])])])):l("",!0)])}const qs=C(bs,[["render",Is]]),As=S({name:"ContestResultsPage",components:{SubmissionResult:_s,ContestResults:qs},computed:{...k({contest:s=>s.contestResults.contest,submissions:s=>s.contestResults.submissions,submission:s=>s.contestResults.submission})},beforeCreate(){this.$store.hasModule("contestResults")||this.$store.registerModule("contestResults",U)},unmounted(){this.$store.hasModule("contestResults")&&this.$store.unregisterModule("contestResults")},async created(){const s=this.$route.query.contest,t=this.$route.query.submission;let i,a,u;s?(i=await this.$http.initialRequest("/contests/results/searchContest/"+s),this.$http.isError(i)||this.setContest(i)):t?([u,a]=await Promise.all([this.$http.initialRequest("/contests/results/searchSubmission/"+t),this.$http.executeGet("/contests/results/participated")]),!u||this.$http.isError(u)?this.$router.replace("/contests/results"):this.setSubmission(u)):a=await this.$http.initialRequest("/contests/results/participated"),this.$http.isError(a)||this.setSubmissions(a)},methods:{...N(["setContest","setSubmissions","setSubmission"])}}),Ds={class:"container card card-body"},Bs={key:2,class:"row"},Os={class:"card card-level-2 card-body"},Xs=["href"],Ls=["href"],Gs={key:3,class:"text-center"};function Ys(s,t,i,a,u,v){const _=$("contest-results"),h=$("submission-result");return o(),n("div",Ds,[s.contest?(o(),j(_,{key:0})):s.submission?(o(),j(h,{key:1})):s.submissions.length?(o(),n("div",Bs,[(o(!0),n(m,null,g(s.submissions,r=>(o(),n("div",{key:r.id,class:"col-sm-4 my-2"},[e("div",Os,[e("p",null,[e("a",{href:`/contests/results?contest=${r.contest.id}`},c(r.contest.name),9,Xs)]),e("a",{href:`/contests/results?submission=${r.id}`,class:"small text-end"}," view submission details ",8,Ls)])]))),128))])):(o(),n("div",Gs," Contests you participated in will show up here! "))])}const Ks=C(As,[["render",Ys]]);export{Ks as default};

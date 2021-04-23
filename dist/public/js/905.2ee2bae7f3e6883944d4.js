(self.webpackChunkmappersguild=self.webpackChunkmappersguild||[]).push([[905],{9905:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>q});var o=s(5393);const n={class:"container card card-body"},i={key:1,class:"row"},r={class:"card card-hover card-level-2 card-body"},c={key:2,class:"text-center"};var a=s(6564);const l={state:{submissions:[],submission:null},mutations:{setSubmissions(e,t){e.submissions=t},setSubmission(e,t){e.submission=t}}},d={key:0,class:"container p-3"},u=(0,o.createTextVNode)(" created by "),m=(0,o.createVNode)("hr",null,null,-1),g={class:"mx-2"},p=(0,o.createVNode)("h5",null," Screening results ",-1),h={key:0},k=(0,o.createVNode)("p",{class:"ms-3"}," Comments are usually each screener's initial thoughts. They're not intended to be constructive feedback and many screeners use comments as notes for determining their top 5. ",-1),b={class:"ms-3"},v={key:0,class:"fas fa-check text-done"},y={class:"ms-4 mb-2 small text-white-50",style:{"word-break":"break-word"}},N={class:"ms-3"},V=(0,o.createVNode)("div",{class:"ms-4 mb-2 small text-white-50",style:{"word-break":"break-word"}}," [no comment] ",-1),B={key:1,class:"ms-3"},f=(0,o.createVNode)("hr",null,null,-1),S={class:"mx-2"},x=(0,o.createVNode)("h5",null," Judging results ",-1),C={key:0},w={class:"ms-3"},D={class:"row ms-3"},R={class:"col-sm-5"},j={class:"table table-sm table-responsive-sm"},T=(0,o.createVNode)("thead",null,[(0,o.createVNode)("tr",null,[(0,o.createVNode)("th",{class:"text-start"}," Category "),(0,o.createVNode)("th",{class:"text-start"}," Score ")])],-1),$={class:"text-start text-capitalize"},J={class:"text-start"},E=(0,o.createVNode)("td",{class:"text-start"}," TOTAL ",-1),M={class:"text-start"},O={class:"col-sm-7 small"},P=(0,o.createTextVNode)(" Comment: "),U={class:"text-white-50",style:{"white-space":"pre-line"}},z={key:1,class:"ms-3"},L=(0,o.defineComponent)({name:"SubmissionResult",computed:Object.assign(Object.assign({},(0,a.rn)({submission:e=>e.contestResults.submission,loggedInUser:e=>e.loggedInUser})),{voteCount(){let e=0;return this.submission.evaluations.forEach((t=>{isNaN(t.vote)||(e+=t.vote)})),e},emptyEvaluationCount(){return this.submission.contest.screeners.length-this.submission.evaluations.length},randomizedJudging(){let e=[...this.submission.judgings];return e=e.sort((()=>Math.random()-.5)),e},randomizedScreening(){let e=[...this.submission.evaluations];return e=e.sort((()=>Math.random()-.5)),e}}),methods:{findTotalJudgingPoints(e){let t=0;return e.forEach((e=>{t+=e.score})),t},findTotalCriteriaPoints(e){let t=0;return e.forEach((e=>{t+=e.criteria.maxScore})),t},findJudgeComment(e){let t="";return e.forEach((e=>{"comments"==e.criteria.name&&(t=e.comment)})),t},filteredAndSortedJudgingScores(e){e=e.filter((e=>"comments"!=e.criteria.name));const t=["musical representation","creativity","limitation","gameplay"];return[...e].sort((function(e,s){return t.indexOf(e.criteria.name)-t.indexOf(s.criteria.name)}))}}});L.render=function(e,t,s,n,i,r){const c=(0,o.resolveComponent)("user-link"),a=(0,o.resolveDirective)("bs-tooltip");return(0,o.openBlock)(),(0,o.createBlock)("div",null,[e.submission?((0,o.openBlock)(),(0,o.createBlock)("div",d,[(0,o.createVNode)("div",null,[(0,o.createVNode)("h4",null,(0,o.toDisplayString)(e.submission.contest.name),1),(0,o.createVNode)("h5",null,[(0,o.withDirectives)((0,o.createVNode)("span",null,(0,o.toDisplayString)(e.submission.name),513),[[a,"anonymized submission name"]])]),(0,o.createVNode)("div",null,[u,(0,o.createVNode)(c,{user:e.submission.creator},null,8,["user"])]),e.loggedInUser&&e.loggedInUser.id==e.submission.creator.id?((0,o.openBlock)(),(0,o.createBlock)("a",{key:0,href:"#",onClick:t[1]||(t[1]=(0,o.withModifiers)((t=>e.$store.commit("setSubmission",null)),["prevent"]))}," show all submissions ")):(0,o.createCommentVNode)("",!0)]),m,(0,o.createVNode)("div",g,[p,e.submission.evaluations&&e.submission.evaluations.length?((0,o.openBlock)(),(0,o.createBlock)("div",h,[k,((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.randomizedScreening,((e,t)=>((0,o.openBlock)(),(0,o.createBlock)("div",{key:e.id},[(0,o.createVNode)("div",null,[(0,o.createVNode)("div",b,[(0,o.createTextVNode)(" User "+(0,o.toDisplayString)(t+1)+" ",1),e.vote?(0,o.withDirectives)(((0,o.openBlock)(),(0,o.createBlock)("i",v,null,512)),[[a,"user placed in top 5"]]):(0,o.createCommentVNode)("",!0)]),(0,o.createVNode)("div",y,(0,o.toDisplayString)(e.comment?e.comment:"[no comment]"),1)])])))),128)),((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.emptyEvaluationCount,(t=>((0,o.openBlock)(),(0,o.createBlock)("div",{key:t},[(0,o.createVNode)("div",null,[(0,o.createVNode)("div",N," User "+(0,o.toDisplayString)(e.submission.evaluations.length+t),1),V])])))),128))])):((0,o.openBlock)(),(0,o.createBlock)("div",B," This contest skipped screening. "))]),f,(0,o.createVNode)("div",S,[x,e.submission.judgings&&e.submission.judgings.length?((0,o.openBlock)(),(0,o.createBlock)("div",C,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.randomizedJudging,((t,s)=>((0,o.openBlock)(),(0,o.createBlock)("div",{key:t.id},[(0,o.createVNode)("div",null,[(0,o.createVNode)("p",w," User "+(0,o.toDisplayString)(s+1),1),(0,o.createVNode)("div",D,[(0,o.createVNode)("div",R,[(0,o.createVNode)("table",j,[T,(0,o.createVNode)("tbody",null,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.filteredAndSortedJudgingScores(t.judgingScores),(e=>((0,o.openBlock)(),(0,o.createBlock)("tr",{key:e.id},[(0,o.createVNode)("td",$,(0,o.toDisplayString)(e.criteria.name),1),(0,o.createVNode)("td",J,(0,o.toDisplayString)(e.score)+"/"+(0,o.toDisplayString)(e.criteria.maxScore),1)])))),128)),(0,o.createVNode)("tr",null,[E,(0,o.createVNode)("td",M,(0,o.toDisplayString)(e.findTotalJudgingPoints(t.judgingScores))+"/"+(0,o.toDisplayString)(e.findTotalCriteriaPoints(t.judgingScores)),1)])])])]),(0,o.createVNode)("div",O,[P,(0,o.createVNode)("span",U,(0,o.toDisplayString)(e.findJudgeComment(t.judgingScores)),1)])])])])))),128))])):((0,o.openBlock)(),(0,o.createBlock)("div",z," This entry did not receive enough screening votes to reach the judging stage. :( "))])])):(0,o.createCommentVNode)("",!0)])};const F=L;const I=(0,o.defineComponent)({name:"ContestResultsPage",components:{SubmissionResult:F},computed:Object.assign({},(0,a.rn)({submissions:e=>e.contestResults.submissions,submission:e=>e.contestResults.submission})),beforeCreate(){this.$store.hasModule("contestResults")||this.$store.registerModule("contestResults",l)},unmounted(){this.$store.hasModule("contestResults")&&this.$store.unregisterModule("contestResults")},created(){return e=this,t=void 0,o=function*(){const e=this.$route.query.submission;let t,s;e?([s,t]=yield Promise.all([this.$http.initialRequest("/contestResults/searchSubmission/"+e),this.$http.executeGet("/contestResults/participated")]),!s||this.$http.isError(s)?this.$router.replace("/contestResults"):this.setSubmission(s)):t=yield this.$http.initialRequest("/contestResults/participated"),this.$http.isError(t)||this.setSubmissions(t)},new((s=void 0)||(s=Promise))((function(n,i){function r(e){try{a(o.next(e))}catch(e){i(e)}}function c(e){try{a(o.throw(e))}catch(e){i(e)}}function a(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,c)}a((o=o.apply(e,t||[])).next())}));var e,t,s,o},methods:Object.assign({},(0,a.OI)(["setSubmissions","setSubmission"]))});I.render=function(e,t,s,a,l,d){const u=(0,o.resolveComponent)("submission-result");return(0,o.openBlock)(),(0,o.createBlock)("div",n,[e.submission?((0,o.openBlock)(),(0,o.createBlock)(u,{key:0})):e.submissions.length?((0,o.openBlock)(),(0,o.createBlock)("div",i,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.submissions,(s=>((0,o.openBlock)(),(0,o.createBlock)("div",{key:s.id,class:"col-sm-4 my-2",onClick:t=>e.setSubmission(s)},[(0,o.createVNode)("div",r,[(0,o.createVNode)("p",null,(0,o.toDisplayString)(s.contest.name),1),(0,o.createVNode)("a",{href:"#",class:"text-secondary small text-end",onClick:t[1]||(t[1]=(0,o.withModifiers)((()=>{}),["prevent"]))}," details ")])],8,["onClick"])))),128))])):((0,o.openBlock)(),(0,o.createBlock)("div",c," Nothing to see here "))])};const q=I}}]);
(self.webpackChunkmappersguild=self.webpackChunkmappersguild||[]).push([[472],{1516:(e,t,i)=>{"use strict";i.d(t,{Z:()=>u});var o=i(5393);const s={class:"modal fade",tabindex:"-1"},n={key:0,class:"modal-content the-a-background"},r={class:"modal-title"},d=(0,o.createVNode)("button",{type:"button",class:"btn-close","data-bs-dismiss":"modal"},null,-1),a={class:"modal-body"},c={key:0,class:"modal-footer"},l=(0,o.defineComponent)({name:"ModalDialog",props:{title:{type:String,default:""},modalSize:{type:String,default:"lg"},headerClass:{type:String,default:"bg-primary"},loaded:{type:Boolean,default:!0}}});l.render=function(e,t,i,l,u,g){return(0,o.openBlock)(),(0,o.createBlock)("div",s,[(0,o.createVNode)("div",{class:["modal-dialog modal-fullscreen-lg-down",`modal-${e.modalSize}`]},[e.loaded?((0,o.openBlock)(),(0,o.createBlock)("div",n,[(0,o.createVNode)("div",{class:["modal-header",e.headerClass||"bg-primary"]},[(0,o.createVNode)("h5",r,[(0,o.renderSlot)(e.$slots,"header",{},(()=>[(0,o.createTextVNode)((0,o.toDisplayString)(e.title),1)]))]),d],2),(0,o.createVNode)("div",a,[(0,o.renderSlot)(e.$slots,"default")]),e.$slots.footer?((0,o.openBlock)(),(0,o.createBlock)("div",c,[(0,o.renderSlot)(e.$slots,"footer")])):(0,o.createCommentVNode)("",!0)])):(0,o.createCommentVNode)("",!0)],2)])};const u=l},4409:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>x});var o=i(5393);const s={key:0,class:"row mb-2"},n={class:"col-sm"},r={class:"card"},d={class:"card-header"},a={class:"my-2"},c={class:"card-body p-0"},l={class:"table table-responsive-sm mb-0"},u={class:"text-start"},g={class:"text-start"},m=(0,o.createVNode)("i",{class:"me-1 fas fa-edit"},null,-1),h={key:0},p={class:"text-center"};var b=i(6564);const f={class:"text-capitalize"},C={key:0,class:"mb-3"},v=(0,o.createVNode)("label",{class:"form-label",for:"score"},"Score",-1),S={key:1,class:"mb-3"},y=(0,o.createVNode)("label",{class:"form-label",for:"comment"}," Comment ",-1),k=(0,o.createVNode)("div",{id:"close-button","data-bs-dismiss":"modal"},null,-1);var B=i(1516);const V=(0,o.defineComponent)({name:"EditingCriteriaModal",components:{ModalDialog:B.Z},data:()=>({editingScore:0,editingComment:""}),computed:Object.assign(Object.assign({},(0,b.rn)({judgingDone:e=>e.judging.judgingDone})),(0,b.Se)(["editingSubmission","editingCriteria"])),watch:{editingSubmission(){this.getUserInput()},editingCriteria(){this.getUserInput()}},methods:{getUserInput(){const e=this.getJudgingToCriterias(this.editingSubmission.id,this.editingCriteria.id);e?(this.editingScore=e.score,this.editingComment=e.comment):(this.editingScore=0,this.editingComment="")},getJudgingToCriterias(e,t){const i=this.judgingDone.find((t=>t.submission.id===e));if(!i)return null;return i.judgingScores.find((e=>e.criteria.id===t))||null},save(e){var t,i,o,s,n,r;return o=this,s=void 0,r=function*(){const o=yield this.$http.executePost("/judging/save",{submissionId:null===(t=this.editingSubmission)||void 0===t?void 0:t.id,criteriaId:null===(i=this.editingCriteria)||void 0===i?void 0:i.id,score:this.editingScore,comment:this.editingComment},e);this.$http.isError(o)||(this.$store.commit("setJudgingDone",o.judgingDone),this.$store.dispatch("updateToastMessages",{message:o.success,type:"info"}))},new((n=void 0)||(n=Promise))((function(e,t){function i(e){try{a(r.next(e))}catch(e){t(e)}}function d(e){try{a(r.throw(e))}catch(e){t(e)}}function a(t){var o;t.done?e(t.value):(o=t.value,o instanceof n?o:new n((function(e){e(o)}))).then(i,d)}a((r=r.apply(o,s||[])).next())}))},closeModal(){var e;null===(e=document.getElementById("close-button"))||void 0===e||e.click()}}});V.render=function(e,t,i,s,n,r){const d=(0,o.resolveComponent)("modal-dialog");return(0,o.openBlock)(),(0,o.createBlock)(d,{id:"editing-judging-modal","data-bs-backdrop":"static","data-bs-keyboard":"false",loaded:Boolean(e.editingSubmission)},{header:(0,o.withCtx)((()=>[(0,o.createTextVNode)((0,o.toDisplayString)(e.editingSubmission.name)+": ",1),(0,o.createVNode)("span",f,(0,o.toDisplayString)(e.editingCriteria.name),1)])),default:(0,o.withCtx)((()=>["comments"!=e.editingCriteria.name?((0,o.openBlock)(),(0,o.createBlock)("div",C,[v,(0,o.withDirectives)((0,o.createVNode)("input",{id:"score","onUpdate:modelValue":t[1]||(t[1]=t=>e.editingScore=t),type:"number",step:"1",min:"0",max:e.editingCriteria.maxScore,class:"form-control"},null,8,["max"]),[[o.vModelText,e.editingScore]])])):((0,o.openBlock)(),(0,o.createBlock)("div",S,[y,(0,o.withDirectives)((0,o.createVNode)("textarea",{id:"comment","onUpdate:modelValue":t[2]||(t[2]=t=>e.editingComment=t),maxlength:"3000",rows:"4",class:"form-control"},null,512),[[o.vModelText,e.editingComment]])]))])),footer:(0,o.withCtx)((()=>[(0,o.createVNode)("button",{type:"button",class:"btn btn-sm btn-outline-secondary",onClick:t[3]||(t[3]=(0,o.withModifiers)((t=>e.closeModal()),["prevent"]))}," Close "),(0,o.createVNode)("button",{type:"button",class:"btn btn-sm btn-outline-primary",onClick:t[4]||(t[4]=(0,o.withModifiers)((t=>e.save(t)),["prevent"]))}," Save changes "),k])),_:1},8,["loaded"])};const N=V,D={state:{contest:null,criterias:[],judgingDone:[],editingSubmissionId:null,editingCriteriaId:null},mutations:{setContest(e,t){e.contest=t},setCriterias(e,t){e.criterias=t},setJudgingDone(e,t){e.judgingDone=t},setEditingSubmissionId(e,t){e.editingSubmissionId=t},setEditingCriteriaId(e,t){e.editingCriteriaId=t}},getters:{editingSubmission:e=>{var t;return null===(t=e.contest)||void 0===t?void 0:t.submissions.find((t=>t.id===e.editingSubmissionId))},editingCriteria:e=>e.criterias.find((t=>t.id===e.editingCriteriaId))}};const j=(0,o.defineComponent)({name:"JudgingPage",components:{EditingCriteriaModal:N},data:()=>({sortBy:"name",sortByCriteria:"",sortDesc:!1}),computed:Object.assign(Object.assign({},(0,b.rn)({contest:e=>e.judging.contest,criterias:e=>e.judging.criterias,judgingDone:e=>e.judging.judgingDone})),{filteredSubmissions(){const e=[];for(let t=0;t<this.contest.submissions.length;t++)this.contest.submissions[t].evaluations.reduce(((e,t)=>t.vote?e+t.vote:e),0)>=this.contest.judgingThreshold&&e.push(t);const t=[];for(const i of e)t.push(this.contest.submissions[i]);return t},sortedSubmissions(){const e=this.filteredSubmissions;return e?("name"===this.sortBy?e.sort(((e,t)=>{var i,o;const s=null===(i=e.name)||void 0===i?void 0:i.toUpperCase(),n=null===(o=t.name)||void 0===o?void 0:o.toUpperCase();return s<n?this.sortDesc?-1:1:s>n?this.sortDesc?1:-1:0})):"total"===this.sortBy?e.sort(((e,t)=>{const i=this.getTotalScore(e.id),o=this.getTotalScore(t.id);return this.sortDesc?i-o:o-i})):"criteria"===this.sortBy?e.sort(((e,t)=>{const i=this.getScore(e.id,this.sortByCriteria),o=this.getScore(t.id,this.sortByCriteria);return this.sortDesc?i-o:o-i})):"completed"===this.sortBy&&e.sort(((e,t)=>{const i=this.isCompleted(e.id);return i===this.isCompleted(t.id)?0:this.sortDesc?i?1:-1:i?-1:1})),e):[]},maxPossibleScore(){return this.criterias.reduce(((e,t)=>t.maxScore+e),0)}}),beforeCreate(){this.$store.hasModule("judging")||this.$store.registerModule("judging",D)},unmounted(){this.$store.hasModule("judging")&&this.$store.unregisterModule("judging")},created(){return e=this,t=void 0,o=function*(){const e=yield this.$http.initialRequest("/judging/relevantInfo");this.$http.isError(e)||(this.$store.commit("setContest",e.contest),this.$store.commit("setCriterias",e.criterias),this.$store.commit("setJudgingDone",e.judgingDone))},new((i=void 0)||(i=Promise))((function(s,n){function r(e){try{a(o.next(e))}catch(e){n(e)}}function d(e){try{a(o.throw(e))}catch(e){n(e)}}function a(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(r,d)}a((o=o.apply(e,t||[])).next())}));var e,t,i,o},methods:{selectForEditing(e,t){this.$store.commit("setEditingSubmissionId",e),this.$store.commit("setEditingCriteriaId",t)},getJudgingToCriterias(e,t){const i=this.judgingDone.find((t=>t.submission.id===e));if(!i)return null;return i.judgingScores.find((e=>e.criteria.id===t))||null},getScore(e,t){const i=this.getJudgingToCriterias(e,t);return i?i.score:0},getTotalScore(e){const t=this.judgingDone.find((t=>t.submission.id===e));return t?t.judgingScores.reduce(((e,t)=>t.score+e),0):0},isCompleted(e){const t=this.judgingDone.find((t=>t.submission.id===e));return!!t&&t.judgingScores.length===this.criterias.length},sortSubmissionsBy(e,t){this.sortBy=e,this.sortDesc=!this.sortDesc,"criteria"===e&&t&&(this.sortByCriteria=t)}}});j.render=function(e,t,i,b,f,C){const v=(0,o.resolveComponent)("editing-criteria-modal");return(0,o.openBlock)(),(0,o.createBlock)("div",null,[e.contest?((0,o.openBlock)(),(0,o.createBlock)("div",s,[(0,o.createVNode)("div",n,[(0,o.createVNode)("div",r,[(0,o.createVNode)("div",d,[(0,o.createVNode)("h4",a,(0,o.toDisplayString)(e.contest.name),1)]),(0,o.createVNode)("div",c,[(0,o.createVNode)("table",l,[(0,o.createVNode)("thead",null,[(0,o.createVNode)("tr",null,[(0,o.createVNode)("th",u,[(0,o.createVNode)("a",{href:"#",onClick:t[1]||(t[1]=(0,o.withModifiers)((t=>e.sortSubmissionsBy("name")),["prevent"]))}," Entry's Name ")]),((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.criterias,(t=>((0,o.openBlock)(),(0,o.createBlock)("th",{key:t.id},[(0,o.createVNode)("a",{href:"#",class:"text-capitalize",onClick:(0,o.withModifiers)((i=>e.sortSubmissionsBy("criteria",t.id)),["prevent"])},(0,o.toDisplayString)(t.name),9,["onClick"])])))),128)),(0,o.createVNode)("th",null,[(0,o.createVNode)("a",{href:"#",onClick:t[2]||(t[2]=(0,o.withModifiers)((t=>e.sortSubmissionsBy("total")),["prevent"]))}," Total ")]),(0,o.createVNode)("th",null,[(0,o.createVNode)("a",{href:"#",onClick:t[3]||(t[3]=(0,o.withModifiers)((t=>e.sortSubmissionsBy("completed")),["prevent"]))}," Completed ")])])]),(0,o.createVNode)("tbody",null,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.sortedSubmissions,(t=>((0,o.openBlock)(),(0,o.createBlock)("tr",{key:t.id},[(0,o.createVNode)("td",g,(0,o.toDisplayString)(t.name),1),((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.criterias,(i=>((0,o.openBlock)(),(0,o.createBlock)("td",{key:i.id,class:"text-start"},[(0,o.createVNode)("a",{href:"#","data-bs-toggle":"modal","data-bs-target":"#editing-judging-modal",onClick:(0,o.withModifiers)((o=>e.selectForEditing(t.id,i.id)),["prevent"])},[m,"comments"!=i.name?((0,o.openBlock)(),(0,o.createBlock)("span",h,(0,o.toDisplayString)(e.getScore(t.id,i.id)+`/${i.maxScore}`),1)):(0,o.createCommentVNode)("",!0)],8,["onClick"])])))),128)),(0,o.createVNode)("td",null,(0,o.toDisplayString)(e.getTotalScore(t.id))+"/"+(0,o.toDisplayString)(e.maxPossibleScore),1),(0,o.createVNode)("td",p,[(0,o.createVNode)("i",{class:["fa",e.isCompleted(t.id)?"fa-check text-success":"fa-times text-danger"]},null,2)])])))),128))])])])])])])):(0,o.createCommentVNode)("",!0),(0,o.createVNode)(v)])};const x=j}}]);
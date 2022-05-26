// evaluations on submission should be virtually populated "screenings" field
// slam this into contests listing relevant info with fully populated shit
for (const contest of contests) {
    if (contest.submissions) {
        for (const submission of contest.submissions) {
            if (submission.evaluations) {
                for (const evaluation of submission.evaluations) {
                    await ScreeningModel.findByIdAndUpdate(evaluation.id, { submission: submission._id });
                    console.log(evaluation.id);
                    console.log(submission._id);
                }
            }
        }
    }
}

// if it works, then delete the evaluations field and use this instead
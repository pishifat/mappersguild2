//beatmap

function deleteMap(id) {
    var result = confirm(`Are you sure?`);
    if (result) {
        $.post(`/admin/deleteMap/${id}`, function (msg) {
            createAlert(msg);
        });
    }
}

//party

function deleteParty(id) {
    var result = confirm(`Are you sure?`);
    if (result) {
        $.post(`/admin/deleteParty/${id}`, function (msg) {
            createAlert(msg);
        });
    }
}

function updatePartyRanks() {
    var result = confirm(`Are you sure?`);
    if (result) {
        $.post(`/admin/updatePartyRanks/`, function (msg) {
            createAlert(msg);
        });
    }
}


//user

function hideUser(id) {
    var result = confirm(`Are you sure?`);
    if (result) {
        $.post(`/admin/hideUser/${id}`, function (msg) {
            createAlert(msg);
        });
    }
}

function unhideUser(id) {
    var result = confirm(`Are you sure?`);
    if (result) {
        $.post(`/admin/unhideUser/${id}`, function (msg) {
            createAlert(msg);
        });
    }
}

function updateUserPoints() {
    var result = confirm(`Are you sure?`);
    if (result) {
        $.post(`/admin/updateUserPoints/`, function (msg) {
            createAlert(msg);
        });
    }
}

function updateUsernames() {
    var result = confirm(`Are you sure?`);
    if (result) {
        $.post(`/admin/updateUsernames/`, function (msg) {
            createAlert(msg);
        });
    }
}

function addSong(labelId) {
    var artist = $("#artist").val();
    var title = $("#title").val();
    $.post(`/admin/addSong/`, { labelId: labelId, artist: artist, title: title }, function (msg) {
        createAlert(msg);
    });
}

function removeSong(labelId) {
    var songId = $("#removeSongSelection").val();
    $.post(`/admin/removeSong/`, { labelId: labelId, songId: songId }, function (msg) {
        createAlert(msg);
    });
}

//other
function printUserSelect(users) {
    var printedUsers = '';
    users.forEach(user => {
        printedUsers += `<option value="${user._id}">${user.username}</option>`
    });
    return printedUsers;
}

function printSongSelect(songs) {
    var printedSongs = '';
    songs.forEach(song => {
        printedSongs += `<option value="${song._id}">${song.artist} - ${song.title}</option>`
    });
    return printedSongs;
}

function printDiffSelect(tasks) {
    var printedTasks = '';
    tasks.forEach(task => {
        printedTasks += `<option value="${task._id}">${task.name} - ${task.mappers[0].username}</option>`
    });
    return printedTasks;
}



//page

$(function () {

    //beatmap
    $('#editMap').on('show.bs.modal', function (e) {
        const id = $(e.relatedTarget).data('mapid');
        $('#editMap .modal-title').text('');
        $('#modderList').text('');
        $('#bnList').text('');
        $('#currentLink').text('');
        $('#diffList').text('');

        $.getJSON('/beatmaps/beatmap/' + id).done(function (b) {
            $('#editMap .modal-title').text(`${b.song.artist} - ${b.song.title} (${b.status})`);

            let diffSelect = printDiffSelect(b.tasks);

            $('#diffList').append(
                `<div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <button style="border-radius: 100px 0 0 100px;" class="rounded-circle-left btn btn-mg-used" id="removeDiff"><i style="padding-left: 4px" class="fas fa-minus"></i></button>
                    </div>
                        <select class="custom-select select-arrow small" id="removeDiffSelection" style="filter: drop-shadow(1px 1px 1px #000000); border-radius: 0 100px 100px 0">
                            ${diffSelect}
                        </select>
                    </div>`);

            let modderSelect = printUserSelect(b.modders);

            $('#modderList').append(
                `<div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <button style="border-radius: 100px 0 0 100px;" class="rounded-circle-left btn btn-mg-used" id="removeModder"><i style="padding-left: 4px" class="fas fa-minus"></i></button>
                    </div>
                        <select class="custom-select select-arrow small" id="removeModderSelection" style="filter: drop-shadow(1px 1px 1px #000000); border-radius: 0 100px 100px 0">
                            ${modderSelect}
                        </select>
                    </div>`);

            let bnSelect = printUserSelect(b.bns);

            $('#bnList').append(
                `<div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <button style="border-radius: 100px 0 0 100px;" class="rounded-circle-left btn btn-mg-used" id="removeNominator"><i style="padding-left: 4px" class="fas fa-minus"></i></button>
                    </div>
                        <select class="custom-select select-arrow small" id="removeNominatorSelection" style="filter: drop-shadow(1px 1px 1px #000000); border-radius: 0 100px 100px 0">
                            ${bnSelect}
                        </select>
                    </div>`);

            if (b.url) {
                $('#currentLink').append(`<a href="${b.url}">${b.url}</a>`)
            }


            $('#editMap #saveMapStatus').click(function () {
                var status = $("#editMap #mapStatusSelect").val();
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/updateMapStatus/`, { id: id, status: status }, function (msg) {
                        $('#editMap').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editMap #removeModder').click(function () {
                var userId = $("#editMap #removeModderSelection").val();
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/removeModder/`, { id: id, userId: userId }, function (msg) {
                        $('#editMap').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editMap #removeNominator').click(function () {
                var userId = $("#editMap #removeNominatorSelection").val();
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/removeNominator/`, { id: id, userId: userId }, function (msg) {
                        $('#editMap').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editMap #removeDiff').click(function () {
                var taskId = $("#editMap #removeDiffSelection").val();
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/removeDiff/`, { id: id, taskId: taskId }, function (msg) {
                        $('#editMap').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editMap #addLinkButton').click(function () {
                var link = $("#editMap #newLink").val();
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/updateMapUrl/`, { id: id, link: link }, function (msg) {
                        $('#editMap').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editMap #deleteMap').click(function () {
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/deleteMap/${id}`, function (msg) {
                        $('#editQuest').modal('hide');
                        createAlert(msg);
                    });
                }
            });
        });
    });

    //quest
    $('#saveQuest').click(function () {
        var name = $("#questName").val();
        var reward = $("#questReward").val();
        var descriptionMain = $("#questDescriptionMain").val();
        var descriptionFluff = $("#questDescriptionFluff").val();
        var timeframe = $("#questTimeframe").val();
        var minParty = $("#questMinParty").val();
        var maxParty = $("#questMaxParty").val();
        var minRank = $("#questMinRank").val();
        var art = $("#art").val();
        var exclusive = $("#exclusive").val();
        var medal = $("#medal").val();
        $.post("/admin/createQuest", { name: name, reward: reward, descriptionMain: descriptionMain, descriptionFluff: descriptionFluff, timeframe: timeframe, minParty: minParty, maxParty: maxParty, minRank: minRank, art: art, exclusive: exclusive, medal: medal }, function (quest) {
            $('#errors').text(`${quest.name} quest created!`);
        });
    });

    $('#editQuest').on('show.bs.modal', function (e) {
        const id = $(e.relatedTarget).data('questid');
        $('#editQuest .modal-title').text('');

        $.getJSON('/quests/quest/' + id).done(function (q) {
            $('#editQuest .modal-title').text(`${q.name} - (${q.status})`);

            $('#editQuest #dropQuest').click(function () {
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/forceDropQuest/${id}`, function (msg) {
                        $('#editQuest').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editQuest #completeQuest').click(function () {
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/completeQuest/${id}`, function (msg) {
                        $('#editQuest').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editQuest #deleteQuest').click(function () {
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/deleteQuest/${id}`, function (msg) {
                        $('#editQuest').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editQuest #hideQuest').click(function () {
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/hideQuest/${id}`, function (msg) {
                        $('#editQuest').modal('hide');
                        createAlert(msg);
                    });
                }
            });

            $('#editQuest #unhideQuest').click(function () {
                var result = confirm(`Are you sure?`);
                if (result) {
                    $.post(`/admin/unhideQuest/${id}`, function (msg) {
                        $('#editQuest').modal('hide');
                        createAlert(msg);
                    });
                }
            });
        });

    })

    //party
    $('#editParty').on('show.bs.modal', function (e) {
        $('#editQuest .modal-title').text('');
        const id = $(e.relatedTarget).data('partyid');

        $.getJSON('/parties/party/' + id).done(function (p) {
            $('#editQuest .modal-title').text(`${p.name} - (${p.leader.username})`);

        });
    });

    $('#editPartyName').on('show.bs.modal', function (e) {
        const id = $(e.relatedTarget).data('partyid');

        $('#savePartyName').click(function () {
            var name = $("#partyRenameInput").val();
            var result = confirm(`Are you sure?`);
            if (result) {
                $.post(`/admin/updatePartyName/`, { id: id, name: name }, function (msg) {
                    $('#editPartyName').modal('hide');
                    createAlert(msg);
                });
            }
        });
    })

    //user
    $('#editUserGroup').on('show.bs.modal', function (e) {
        const id = $(e.relatedTarget).data('userid');

        $('#saveUserGroup').click(function () {
            var group = $("#userGroupSelect").val();
            var result = confirm(`Are you sure?`);
            if (result) {
                $.post(`/admin/updateUserGroup/`, { id: id, group: group }, function (msg) {
                    $('#editUserGroup').modal('hide');
                    createAlert(msg);
                });
            }
        });
    })


    //featured artist
    $('#saveArtist').click(function () {
        var artist = $("#newArtistInput").val();
        $.post(`/admin/addArtist/${artist}`, function (msg) {
            $('#newArtist').modal('hide');
            createAlert(msg);
        });
    });

    $('#editSongs').on('show.bs.modal', function (e) {
        $('#editSongs .modal-title').text('');
        $('#editSongSelect').text('');
        $('#removeSongSelect').text('');
        const id = $(e.relatedTarget).data('artistid');

        $.getJSON('/admin/artist/' + id).done(function (a) {
            $('#editSongs .modal-title').text(a.label);

            $('#addSong').attr("onclick", `addSong('${a._id}')`);

            let songSelect = printSongSelect(a.songs);
            console.log(songSelect)
            $('#editSongs #removeSong').attr("onclick", `removeSong('${a._id}');`)

            $('#editSongs #removeSongSelection').html(songSelect);
            $('#editSongSelection').html(songSelect);

        });


    });

});

function createAlert(message) {
    var $div = $("<div>", {
        "class": "alert alert-success alert-dismissible fade show alert-fixed",
        "text": message
    });

    var $button = $("<button>", {
        "type": "button",
        "class": "close",
        "data-dismiss": "alert"
    });

    var $span = $("<span>", {
        "html": "&times;"
    });

    $button.append($span);
    $div.append($button);

    $div.appendTo("body").fadeTo(1200, 1).slideUp(500, function () {
        $(this).alert("close")
    });
};
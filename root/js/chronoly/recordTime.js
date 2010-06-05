//
// recordTime.js
//
// Functions related to recording time in Basecamp
//

// This information could be cached locally when
// we get the todo lists, should check that out next
function getToDoItems() {
    $('#item_select > option').remove();
    $('#item_select').attr('disabled', 'disabled');

    if ($(this).val() == -1)
        return;

    showLoading();
    $.get(base_url + '/todo_lists/' + $(this).val() + '#{id}.xml', function(data) {
        hideLoading();

        $('#item_select').append('<option value="-1">Select a task</option>');

        $(data).find('todo-items > todo-item').sort(byContent).each(function() {
            // Skip items that have been completed
            if ( $(this).children('completed').text() == 'true' )
                return;

            var todo_item_id = $(this).children('id').text();
            var todo_item_content = $(this).children('content').text();

            $('#item_select').append('<option value="' + todo_item_id + '">' + todo_item_content + '</option>');
            $('#item_select').attr('disabled', null);
        });

    });
}

function getToDoList() {
    $('#todo_list_select > option').remove();
    $('#item_select > option').remove();
    $('#todo_list_select').attr('disabled', 'disabled');
    $('#item_select').attr('disabled', 'disabled');

    if ($(this).val() == -1)
        return;

    showLoading();
    $.get(base_url + '/projects/' + $(this).val() + '/todo_lists.xml?filter=pending', function(data) {
        hideLoading();

        $('#todo_list_select').append('<option value="-1">Select a list</option>');

        $(data).find('todo-lists > todo-list').sort(byName).each(function() {
            // Skip lists that don't have time tracking turned on
            if ( $(this).children('tracked').text() != 'true' )
                return;

            var todo_list_id = $(this).children('id').text();
            var todo_list_name = $(this).children('name').text();

            $('#todo_list_select').append('<option value="' + todo_list_id + '">' + todo_list_name + '</option>');
        });

        $('#todo_list_select').change(getToDoItems);
        $('#todo_list_select').attr('disabled', null);

    });
}

function getProjectList() {
    showLoading();
    $.get(base_url + '/projects.xml', function(data) {
        hideLoading();

        $('#project_select').append('<option value="-1">Select a project</option>');

        $(data).find('projects > project').sort(byName).each(function() {
            if ( $(this).children('status').text() != 'active' )
                return;

            var project_id = $(this).children('id').text();
            var project_name = $(this).children('name').text();

            $('#project_select').append('<option value="' + project_id + '">' + project_name + '</option>');
        });

        $('#project_select').change(getToDoList);
        $('#project_select').attr('disabled', null);

    });
}

function byName(a, b) {
    if ( $(a).children('name').text() < $(b).children('name').text() ) {
        return -1;
    } else if ( $(a).children('name').text() == $(b).children('name').text() ) {
        return 0;
    } else {
        return 1;
    }
}

function byContent(a, b) {
    if ( $(a).children('content').text() < $(b).children('content').text() ) {
        return -1;
    } else if ( $(a).children('content').text() == $(b).children('content').text() ) {
        return 0;
    } else {
        return 1;
    }
}

function submitTime() {
    var item_id = $('#item_select').val();
    if (item_id == -1 || item_id == null)
        return;
    
    var date = dateToString(new Date());
    
    var hours = $('#time_input').val();
    // Currently just return, but really need to give
    // the user a message. Also need validation that it's a number
    if (hours == '')
        return;

    var description = $('#time_description').val();

    // FIXME: do this with jQuery instead of making it with string concatination?
    var xml = '<time-entry>'
        + '<person-id>' + user_id + '</person-id>'
        + '<date>' + date + '</date>'
        + '<hours>' + hours + '</hours>'
        + '<description>' + description + '</description>'
        + '</time-entry>'

    stopTimer();
    showLoading();
    $.ajax({
        url: base_url + '/todo_items/' +  item_id + '/time_entries.xml',
        type: 'POST',
        data: xml,
        dataType: 'text',
        success: function(data, textStatus) {
            hideLoading();
            showMessage('Time successfully entered!');
            $('#time_input').val(0);
            $('#time_description').val('');
            getTimeReports();
        }
    });
}

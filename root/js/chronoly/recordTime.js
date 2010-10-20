//
// recordTime.js
//
// Functions related to recording time in Basecamp
//

CHRONOLY.timeRecorder = function() { return {

    // This information could be cached locally when
    // we get the todo lists, should check that out next
    getToDoItems: function() {
        $('#item_select > option').remove();
        $('#item_select').attr('disabled', 'disabled');
        
        if ($(this).val() == -1)
            return;
        
        CHRONOLY.showLoading();
        $.get(CHRONOLY.base_url + '/todo_lists/' + $(this).val() + '#{id}.xml', function(data) {
            CHRONOLY.hideLoading();
            
            $('#item_select').append('<option value="-1">Select a task</option>');
            
            $(data).find('todo-items > todo-item').sort(CHRONOLY.timeRecorder.byContent).each(function() {
                // Skip items that have been completed
                if ( $(this).children('completed').text() == 'true' )
                    return;
                
                var todo_item_id = $(this).children('id').text();
                var todo_item_content = $(this).children('content').text();
                
                $('#item_select').append('<option value="' + todo_item_id + '">' + todo_item_content + '</option>');
                $('#item_select').attr('disabled', null);
            });
            
        });
    },
    
    getToDoList: function() {
        $('#todo_list_select > option').remove();
        $('#item_select > option').remove();
        $('#todo_list_select').attr('disabled', 'disabled');
        $('#item_select').attr('disabled', 'disabled');
        
        if ($(this).val() == -1)
            return;
        
        CHRONOLY.showLoading();
        $.get(CHRONOLY.base_url + '/projects/' + $(this).val() + '/todo_lists.xml?filter=pending', function(data) {
            CHRONOLY.hideLoading();

            $('#todo_list_select').append('<option value="-1">Select a list</option>');
            
            $(data).find('todo-lists > todo-list').sort(CHRONOLY.timeRecorder.byName).each(function() {
                // Skip lists that don't have time tracking turned on
                if ( $(this).children('tracked').text() != 'true' )
                    return;
                
                var todo_list_id = $(this).children('id').text();
                var todo_list_name = $(this).children('name').text();
                
                $('#todo_list_select').append('<option value="' + todo_list_id + '">' + todo_list_name + '</option>');
            });
            
            $('#todo_list_select').change(CHRONOLY.timeRecorder.getToDoItems);
            $('#todo_list_select').attr('disabled', null);
            
        });
    },

    getProjectList: function() {
        CHRONOLY.showLoading();
        $.get(CHRONOLY.base_url + '/projects.xml', function(data) {
            CHRONOLY.hideLoading();
            
            $('#project_select').append('<option value="-1">Select a project</option>');
            
            $(data).find('projects > project').sort(CHRONOLY.timeRecorder.byName).each(function() {
            if ( $(this).children('status').text() != 'active' )
                return;
                
                var project_id = $(this).children('id').text();
                var project_name = $(this).children('name').text();
                
                $('#project_select').append('<option value="' + project_id + '">' + project_name + '</option>');
            });
            
            $('#project_select').change(CHRONOLY.timeRecorder.getToDoList);
            $('#project_select').attr('disabled', null);
            
        });
    },

    byName: function(a, b) {
        if ( $(a).children('name').text() < $(b).children('name').text() ) {
            return -1;
        } else if ( $(a).children('name').text() == $(b).children('name').text() ) {
            return 0;
        } else {
            return 1;
        }
    },

    byContent: function(a, b) {
        if ( $(a).children('content').text() < $(b).children('content').text() ) {
            return -1;
        } else if ( $(a).children('content').text() == $(b).children('content').text() ) {
            return 0;
        } else {
        return 1;
        }
    },

    submitTime: function() {
        var item_id     = $('#item_select').val();
        var hours       = $('#time_input').val();
        var description = $('#time_description').val();
        
        var date           = CHRONOLY.selectsToDate();
        var validation_obj = this._validate_time_params(item_id, hours);
        
        if ( validation_obj.valid == false ) {
            CHRONOLY.showMessage(validation_obj.msg);
            return;
        }
        
        var time_ajax_params = this._build_submit_time_ajax_params(item_id, hours, description, date);
        
        CHRONOLY.timer.stopTimer();
        CHRONOLY.showLoading();
        $.ajax(time_ajax_params);
    },
    
    _validate_time_params: function(item_id, hours) {
        var validation_obj   = {};
        validation_obj.valid = true;
        validation_obj.msg   = '';
        
        if (item_id == -1 || item_id == null) {
            validation_obj.valid = false;
            validation_obj.msg   = 'No valid todo item selected.';
        }
        else if (hours == '' || hours == 0) {
            validation_obj.valid = false;
            validation_obj.msg   = 'Time value is not valid.';
        }
        
        return validation_obj;
    },

    _build_submit_time_ajax_params: function(item_id, hours, description, date) {
        var date = CHRONOLY.dateToString(date);
        
        var ajax_params      = {};
        ajax_params.url      = CHRONOLY.base_url + '/todo_items/' +  item_id + '/time_entries.xml';
        ajax_params.type     = 'POST';
        ajax_params.dataType = 'text';
        
        ajax_params.success  = function(data, textStatus) {
            CHRONOLY.hideLoading();
            CHRONOLY.showMessage('Time successfully entered!');
            
            // Reset inputs
            $('#time_input').val(0);
            $('#time_description').val('');
            
            CHRONOLY.reporter.getTimeReports();
        };
        
        var xmlDoc    = $('<xml>');
        var timeEntry = $('<time-entry>').appendTo(xmlDoc);
        
        $('<person-id>').html(CHRONOLY.user_id).appendTo(timeEntry);
        $('<date>').html(date).appendTo(timeEntry);
        $('<hours>').html(hours).appendTo(timeEntry);
        $('<description>').html(description).appendTo(timeEntry);
        
        // Only returns innerHTML, but that's okay because the outer
        // xml tag is a placeholder
        ajax_params.data = $(xmlDoc).html();
        
        return ajax_params;
    },

    completeTodoItem: function() {
        var item_id = $('#item_select').val();
        
        var validation_obj = this._validate_item(item_id);
        
        if ( validation_obj.valid == false ) {
            CHRONOLY.showMessage(validation_obj.msg);
            return;
        }
        
        var complete_ajax_params = this._build_complete_item_ajax_params(item_id);
        
        CHRONOLY.showLoading();
        $.ajax(complete_ajax_params);
    },

    _validate_item: function(item_id) {
        var validation_obj   = {};
        validation_obj.valid = true;
        validation_obj.msg   = '';
        
        if (item_id == -1 || item_id == null) {
            validation_obj.valid = false;
            validation_obj.msg   = 'No valid todo item selected.';
        }

        return validation_obj;
    },

    _build_complete_item_ajax_params: function(item_id) {
        var ajax_params      = {};
        
        ajax_params.url      = CHRONOLY.base_url + '/todo_items/' +  item_id + '/complete.xml';
        ajax_params.type     = 'PUT';
        ajax_params.dataType = 'text';
        
        ajax_params.success  = function(data, textStatus) {
            CHRONOLY.hideLoading();
            CHRONOLY.showMessage('Item successfully completed!');
            // Trigger a refresh of the todo list items
            $('#todo_list_select').change();
        };
        
        return ajax_params;
    },

}}();

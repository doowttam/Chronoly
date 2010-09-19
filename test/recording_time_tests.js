$(document).ready(function() {
    module("Recording Time");

    test("Validate Time Params", function() {
        expect(5);

        var validation_obj = _validate_time_params(-1, 4);
        same(
            validation_obj,
            {
                valid: false,
                msg:   'No valid todo item selected.'
            },
            'Validation catches -1 item_id as invalid'
        );

        validation_obj = _validate_time_params(null, 4);
        same(
            validation_obj,
            {
                valid: false,
                msg:   'No valid todo item selected.'
            },
            'Validation catches null item_id as invalid'
        );

        validation_obj = _validate_time_params(1, '');
        same(
            validation_obj,
            {
                valid: false,
                msg:   'Time value is not valid.'
            },
            'Validation catches empty hours as invalid'
        );

        validation_obj = _validate_time_params(1, 0);
        same(
            validation_obj,
            {
                valid: false,
                msg:   'Time value is not valid.'
            },
            'Validation catches 0 hours as invalid'
        );

        validation_obj = _validate_time_params(1, 5);
        same(
            validation_obj,
            {
                valid: true,
                msg:   ''
            },
            'Valid params pass validation'
        );
    });

    test("Build Submit Time AJAX Params", function() {
        expect(8);

        // Set up the global variables
        base_url = 'test.com';
        user_id  = 42;

        var dateString = dateToString(new Date());

        var ajax_params = _build_submit_time_ajax_params(1, 1, 'test description', new Date());
        equals(
            ajax_params.url,
            'test.com/todo_items/1/time_entries.xml',
            'URL built correctly'
        );
        equals(
            ajax_params.type,
            'POST',
            'Request type correct'
        );
        equals(
            ajax_params.dataType,
            'text',
            'Data type correct'
        );
        ok(
            ajax_params.success,
            'Success callback function provided'
        );

        var expected_data
            = '<time-entry>'
            + '<person-id>42</person-id>'
            + '<date>' + dateString + '</date>'
            + '<hours>1</hours>'
            + '<description>test description</description>'
            + '</time-entry>';

        equals(
            ajax_params.data,
            expected_data,
            'XML data built correctly.'
        );

        // No Description
        ajax_params = _build_submit_time_ajax_params(1, 1, '', new Date());

        expected_data
            = '<time-entry>'
            + '<person-id>42</person-id>'
            + '<date>' + dateString + '</date>'
            + '<hours>1</hours>'
            + '<description></description>'
            + '</time-entry>';

        equals(
            ajax_params.data,
            expected_data,
            'XML data built correctly when no description'
        );

        // Description with &
        ajax_params = _build_submit_time_ajax_params(1, 1, 'this & this', new Date());

        expected_data
            = '<time-entry>'
            + '<person-id>42</person-id>'
            + '<date>' + dateString + '</date>'
            + '<hours>1</hours>'
            + '<description>this &amp; this</description>'
            + '</time-entry>';

        equals(
            ajax_params.data,
            expected_data,
            'Ampersand properly escaped'
        );

        // Different date
        var date = new Date();
        date.setYear(2009);

        dateString = dateToString(date);

        ajax_params = _build_submit_time_ajax_params(1, 1, '', date);

        expected_data
            = '<time-entry>'
            + '<person-id>42</person-id>'
            + '<date>' + dateString + '</date>'
            + '<hours>1</hours>'
            + '<description></description>'
            + '</time-entry>';

        equals(
            ajax_params.data,
            expected_data,
            'XML data built correctly when different date'
        );
    });

    test("Validate Complete Item Params", function() {
        expect(3);

        var validation_obj = _validate_item(-1);
        same(
            validation_obj,
            {
                valid: false,
                msg:   'No valid todo item selected.'
            },
            'Validation catches -1 item_id as invalid'
        );

        validation_obj = _validate_item(null);
        same(
            validation_obj,
            {
                valid: false,
                msg:   'No valid todo item selected.'
            },
            'Validation catches null item_id as invalid'
        );

        validation_obj = _validate_item(1);
        same(
            validation_obj,
            {
                valid: true,
                msg:   ''
            },
            'Valid params pass validation'
        );
    });

    test("Build Complete Item AJAX Params", function() {
        expect(4);

        // Set up the global variables
        base_url = 'test.com';
        user_id  = 42;

        var ajax_params = _build_complete_item_ajax_params(1);
        equals(
            ajax_params.url,
            'test.com/todo_items/1/complete.xml',
            'URL built correctly'
        );
        equals(
            ajax_params.type,
            'PUT',
            'Request type correct'
        );
        equals(
            ajax_params.dataType,
            'text',
            'Data type correct'
        );
        ok(
            ajax_params.success,
            'Success callback function provided'
        );
    });
});

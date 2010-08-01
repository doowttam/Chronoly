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
});

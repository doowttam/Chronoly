$(document).ready(function() {
    module("Utility Functions");

    test("Time Conversions", function() {
        expect(2);

        var oneHourInMS = hoursToMS(1);
        equals(
            oneHourInMS,
            3600000,
            'Expected: 3600000, got: ' +  oneHourInMS
        );

        var oneHour = msToHours(3600000);
        equals(
            oneHour,
            1,
            'Expected: 1, got: ' +  oneHour
        );
    });
});

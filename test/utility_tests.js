$(document).ready(function() {
    module("Utility Functions");

    test("Time Conversions", function() {
        expect(2);

        var oneHourInMS = CHRONOLY.hoursToMS(1);
        equals(
            oneHourInMS,
            3600000,
            'Expected: 3600000, got: ' +  oneHourInMS
        );

        var oneHour = CHRONOLY.msToHours(3600000);
        equals(
            oneHour,
            1,
            'Expected: 1, got: ' +  oneHour
        );
    });

    test("Date Hint", function() {
        expect(5);

        var today         = new Date();

        var compareToDate = today;
        var hint          = CHRONOLY.generateDateHint(compareToDate);

        equals(
            hint,
            null,
            'Date hint for today should be null. No hint.'
        );
        
        compareToDate = new Date();
        compareToDate.setTime( today.getTime() - CHRONOLY.CONSTANTS.MSINADAY );
        hint          = CHRONOLY.generateDateHint(compareToDate);

        equals(
            hint,
            'Yesterday',
            'Yesterday gives simple hint'
        );

        compareToDate = new Date();
        compareToDate.setTime( today.getTime() + CHRONOLY.CONSTANTS.MSINADAY );
        hint          = CHRONOLY.generateDateHint(compareToDate);

        equals(
            hint,
            'Tomorrow',
            'Tomorrow gives simple hint'
        );

        compareToDate = new Date();
        compareToDate.setTime( today.getTime() + 4 * CHRONOLY.CONSTANTS.MSINADAY );
        hint          = CHRONOLY.generateDateHint(compareToDate);

        equals(
            hint,
            '4 days from now',
            '4 days gives more complicated date hint'
        );

        compareToDate = new Date();
        compareToDate.setTime( today.getTime() - 4 * CHRONOLY.CONSTANTS.MSINADAY );
        hint          = CHRONOLY.generateDateHint(compareToDate);

        equals(
            hint,
            '4 days ago',
            '4 days gives more complicated date hint'
        );
    });
});

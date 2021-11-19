import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import TimeSlots from './'

test('First time slot should equal 9-9:30', () => {
    const component = shallow(<TimeSlots />);

    expect(component.find(".bookingSlotWrapper")
        .find(".bookingSlot").first()).toBe("9:00 - 9:30")
});

test('First unavailable slot should be equal to 11-11:30', () => {

})
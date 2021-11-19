import React from 'react';
import renderer from 'react-test-renderer';
import TimeSlots from './components/molecules/TimeSlots'

test('Component matches snapshot', () => {
    const component = renderer.create(
        <TimeSlots />,
    );
    let output = component.toJSON();
    expect(output).toMatchSnapshot();
  });
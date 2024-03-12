// @flow
import React from 'react';

class TimeSlots extends React.Component {
    constructor() {
        const bookingOpeningTime = 9
        const bookingClosingTime = 17
        const hourSplitAmount = 2
        const initialBookedSlotTimes = [ "11:00", "12:00", "12:30", "15:30" ]

        super()

        this.state = {
            updateState: true,
            bookingSlots: this.CreateTimeSlots(bookingOpeningTime, bookingClosingTime, hourSplitAmount),
            selectedSlots: [],
            bookedSlots: [],
        }

        this.setState({bookingSlots: this.SetBookingSlotsAsUnavailable(this.state.bookingSlots, initialBookedSlotTimes)})
    }

    // hourSplitAmount; 1=hour 2=half hour, 4=15 minutes
    CreateTimeSlots (startTime, endTime, hourSplitAmount = 1) {
        const timeSlotQty = endTime - startTime
        let bookingSlots = []
        let index = 0

        for (let i=startTime; i<startTime+timeSlotQty; i++) {
            const increment = this.HourSplitIncrement(hourSplitAmount)
            let currentTimeSlotMinutes = 0

            for (let j=0; j<hourSplitAmount; j++){
                bookingSlots.push(this.CreateTimeSlot(
                    index,
                    this.GetFormattedTime(i, currentTimeSlotMinutes), 
                    this.GetFormattedTime(i, currentTimeSlotMinutes + increment), 
                    "available"))
                currentTimeSlotMinutes = currentTimeSlotMinutes + increment
                index = index + 1
            }
        }
        return bookingSlots
    }

    CreateTimeSlot (slotId, startTime, endTime, bookingStatus) {
        let slot = {
            slotId: slotId,
            startTime: startTime,
            endTime: endTime,
            bookingStatus: bookingStatus,
        }
        return slot
    }

    HourSplitIncrement (hourSplitAmount) {
        let increment = 0

        switch(hourSplitAmount) {
            case 1:
                increment = 60
                break
            case 2:
                increment = 30
                break
            case 4:
                increment = 15
                break
            default:
                increment = 60
        }
        return increment
    }

    GetFormattedTime (hour, minute) {
        let outputHour = hour
        let outputMinute = minute
        if (outputMinute === 60) {
            outputHour = outputHour + 1
            outputMinute = 0
        }

        return `${outputHour}:${outputMinute.toLocaleString('en-AU', {minimumIntegerDigits: 2, useGrouping:false})}`
    }

    SetBookingSlotsAsUnavailable (bookingSlots, initialSlots) {
        return bookingSlots.map(slot => {
            let newSlot = slot
            if (initialSlots.includes(newSlot.startTime)) {
                newSlot.bookingStatus = "unavailable"
            }
            return newSlot
        })
    }

    HandleSelectionClick(object) {
        this.setState({ updateState: true }, () => {
            if (object.bookingStatus === "unavailable" || object.bookingStatus === "booked") {
                // Do nothing as this slot cannot be booked
            } else if (object.bookingStatus === "selected") {
                if (
                    object.slotId !== this.state.selectedSlots[0].slotId &&
                    object.slotId !== this.state.selectedSlots[this.state.selectedSlots.length - 1].slotId
                ) {
                    alert("You can only deselect the first or last selected time slot!");
                } else {
                    this.setState((prevState) => ({
                        selectedSlots: prevState.selectedSlots.filter((slots) => slots.slotId !== object.slotId),
                    }));
                }
            } else {
                if (this.state.selectedSlots.length === 0) {
                    this.setState({ selectedSlots: [object] });
                } else if (
                    object.slotId !== this.state.selectedSlots[0].slotId - 1 &&
                    object.slotId !== this.state.selectedSlots[this.state.selectedSlots.length - 1].slotId + 1
                ) {
                    alert("You must select an adjacent time slot to those already selected!");
                } else {
                    this.setState((prevState) => ({
                        selectedSlots: [...prevState.selectedSlots, object].sort((a, b) => a.slotId - b.slotId),
                    }));
                }
            }
        });
    }

    HandleReturnSlotsClick(slotArray) {
        this.setState({bookingSlots: this.state.bookingSlots.map(bookingSlot => {
            let newSlot = bookingSlot
            if (slotArray.some(slot => slot.slotId === bookingSlot.slotId)) {
                newSlot.bookingStatus = "available"
            }
            return newSlot
        }),
            bookedSlots: this.state.bookedSlots.filter(bookedSlot => slotArray !== bookedSlot )
        })
    }

    // Handle booking on the backend
    async bookSlotOnBackend(selectedSlots) {
        try {
            const response = await fetch('http://localhost:5000/api/bookSlot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ selectedSlots }),
            });

            if (response.ok) {
                // Update the frontend state or perform other actions
                console.log('Booking successful');
            } else {
                console.error('Booking failed');
            }
        } catch (error) {
            console.error('Error booking slot:', error);
        }
    }


    // Modified method to handle booking confirmation
    async HandleConfirmClick() {
        await this.bookSlotOnBackend(this.state.selectedSlots);

        this.setState({
            bookingSlots: this.state.bookingSlots.map((slot) => {
                if (this.state.selectedSlots.some((selectedSlot) => selectedSlot.slotId === slot.slotId)) {
                    return { ...slot, bookingStatus: 'booked' };
                }
                return slot;
            }),
            bookedSlots: [...this.state.bookedSlots, this.state.selectedSlots],
            selectedSlots: [],
        });
    }

    // New method to fetch booked slots from the backend
    async fetchBookedSlots() {
        try {
            const response = await fetch('http://localhost:5000/api/bookingSlots');
            if (response.ok) {
                const data = await response.json();
                this.setState({ bookedSlots: data });
            } else {
                console.error('Failed to fetch booked slots');
            }
        } catch (error) {
            console.error('Error fetching booked slots:', error);
        }
    }

    // New lifecycle method to fetch booked slots when the component mounts
    async componentDidMount() {
        await this.fetchBookedSlots();
    }

    render() {
        return (
            <React.Fragment>
                {this.state.selectedSlots.length > 0 &&
                    <div className={"selectionWrapper"}> 
                        <h2>{"Selected Booking Time"}</h2>
                        <div>
                            <div>{`Start Time: ${this.state.selectedSlots[0].startTime} - End Time: ${this.state.selectedSlots[this.state.selectedSlots.length-1].endTime} `}
                                <button onClick={() => this.HandleConfirmClick()}>{"Confirm Booking"}</button>
                            </div>
                        </div>
                    </div>
                }
                {this.state.bookedSlots.length > 0 &&
                    <div className={"bookedSlotsWrapper"}>
                        <h2>{"Booked Times"}</h2>
                        {this.state.bookedSlots.map((slotArray, i) => {
                            return (
                                <div key={i}>
                                    <div>
                                        {`Start Time: ${slotArray[0].startTime} - End Time: ${slotArray[slotArray.length-1].endTime} `}
                                        <button onClick={() => this.HandleReturnSlotsClick(slotArray)}>{"Return Booking"}</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
                <div className={"bookingSlotsWrapper"}>
                    {this.state.bookingSlots.map((slot) => (
                        <div key={slot.slotId} className={"bookingSlot " + slot.bookingStatus} onClick={() => this.HandleSelectionClick(slot)}>
                            <div>{`${slot.startTime} - ${slot.endTime}`}</div>
                        </div>
                    ))}
                </div>

            </React.Fragment>
        )
    }
}

export default TimeSlots
import { Inngest } from "inngest";
import User from "../models/user.js";
import Booking from "../models/booking.js";
import Show from "../models/show.js";
import sendEmail from "../configs/nodeMailer.js";
import { clerkClient } from "@clerk/express";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk', triggers: [{ event: 'clerk/user.created' }] }, // ✅ triggers array
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData)
    }
)

const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk', triggers: [{ event: 'clerk/user.deleted' }] }, // ✅
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
    }
)

const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk', triggers: [{ event: 'clerk/user.updated' }] }, // ✅
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData)
    }
)

//Inngwst function to cancel booking and release seats of show after 10 minutes of booking created if payment is not done

const releaseSeatsAndDeleteBooking = inngest.createFunction(
    { id: 'release-seats-delete-booking' ,
    triggers: [{ event: "app/checkpayment" }]},
    async ({ event, step }) => {
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);
        
        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);
            
            // If payment is not made, release seats and delete booking
            if (!booking.isPaid) {
                const show = await Show.findById(booking.show);
                
                booking.bookedSeats.forEach((seat) => {
                    delete show.occupiedSeats[seat]
                });
                
                show.markModified('occupiedSeats')
                await show.save()
                await Booking.findByIdAndDelete(booking._id)
            }
        })
    }
)

const sendBookingConfirmationEmail = inngest.createFunction(
    {
        id: "send-booking-confirmation-email",
        triggers: [{ event: "app/show.booked" }]
    },
    async ({ event, step }) => {
        const { bookingId } = event.data;

        await step.run('send-email', async () => {
            const booking = await Booking.findById(bookingId).populate({
                path: 'show',
                populate: { path: "movie", model: "Movie" }
            });

            throw new Error(`DEBUG — booking.user: ${booking.user}`);

            // Safe email extraction
            const clerkUser = await clerkClient.users.getUser(booking.user);
            
            const email = clerkUser.primaryEmailAddress?.emailAddress
                       || clerkUser.emailAddresses?.[0]?.emailAddress;

            if (!email) throw new Error(`No email found for user: ${booking.user}`);

            await sendEmail({
                to: email,
                subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
                body: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                        <h2>Hi ${clerkUser.firstName},</h2>
                        <p>Your booking for <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> is confirmed.</p>
                        <p>
                            <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
                            <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
                        </p>
                        <p>Enjoy the show! 🎬</p>
                        <p>Thanks for booking with us!<br/>- GrabAndCorn Team</p>
                    </div>
                `
            });
        });
    }
);



export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail];
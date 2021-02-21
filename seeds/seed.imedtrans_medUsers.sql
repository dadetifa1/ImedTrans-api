INSERT INTO public.med_users
(useremail, userpassword)
VALUES('tester', 'tester');

INSERT INTO public.transport_entry
(starting_location, destination_location, date_of_transport, mileage, create_date, "requested_userId")
VALUES('{
	"address": "21 jump st",
	"lat": 40.712776,
	"lon": -74.005974
}', '{
	"address": "21 jump st",
	"lat": 40.712776,
	"lon": -74.005974
}', now(), 12, now(), 1);
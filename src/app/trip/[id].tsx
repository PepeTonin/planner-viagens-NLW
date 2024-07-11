import { useEffect, useState } from "react";
import { Alert, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import dayjs from "dayjs";
import { DateData } from "react-native-calendars";
import {
  CalendarRange,
  Info,
  MapPin,
  Settings2,
  Calendar as IconCalendar,
} from "lucide-react-native";

import { TripDetails, tripServer } from "@/server/trip-server";

import { colors } from "@/styles/colors";

import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";

import { Loading } from "@/components/loading";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { Activities } from "./activities";
import { Details } from "./details";

export type TripData = TripDetails & { when: string };

enum ModalEnum {
  NONE = 0,
  UPDATE_TRIP = 1,
  CALENDAR = 2,
}

export default function Trip() {
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);

  const [showModal, setShowModal] = useState(ModalEnum.NONE);

  const [tripDetails, setTripDetails] = useState({} as TripData);
  const [option, setOption] = useState<"activity" | "details">("activity");
  const [destination, setDestination] = useState("");
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);

  const tripId = useLocalSearchParams<{ id: string }>().id;

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true);
      if (!tripId) {
        return router.back();
      }
      const trip = await tripServer.getById(tripId);

      const maxLengthDestination = 14;
      const destination =
        trip.destination.length > maxLengthDestination
          ? trip.destination.slice(0, maxLengthDestination) + "..."
          : trip.destination;

      const startsAt = dayjs(trip.starts_at).format("DD");
      const endsAt = dayjs(trip.ends_at).format("DD");
      const month = dayjs(trip.ends_at).format("MMM");

      setDestination(trip.destination);

      setTripDetails({
        ...trip,
        when: `${destination} de ${startsAt} a ${endsAt} de ${month}`,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingTrip(false);
    }
  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });
    setSelectedDates(dates);
  }

  async function handleUpdateTrip() {
    try {
      if (!tripId) return;

      if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
        return Alert.alert(
          "Atualizar viagem",
          "Preencha corretamente os dados da viagem."
        );
      }

      setIsUpdatingTrip(true);

      await tripServer.update({
        id: tripId,
        destination,
        starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
      });

      Alert.alert(
        "Atualizar viagem",
        "Tem certeza que deseja atualizar viagem?",
        [
          {
            text: "Não",
            style: "cancel",
            onPress: () => setIsUpdatingTrip(false),
          },
          {
            text: "Sim",
            onPress: async () => {
              await getTripDetails();
              setIsUpdatingTrip(false);
              setShowModal(ModalEnum.NONE);
            },
          },
        ]
      );
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getTripDetails();
  }, []);

  if (isLoadingTrip) {
    return <Loading />;
  }

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDetails.when} readOnly />
        <TouchableOpacity
          onPress={() => setShowModal(ModalEnum.UPDATE_TRIP)}
          activeOpacity={0.6}
        >
          <View className="w-9 h-9 bg-zinc-700 items-center justify-center rounded">
            <Settings2 color={colors.zinc[400]} size={20} />
          </View>
        </TouchableOpacity>
      </Input>

      {option === "activity" ? (
        <Activities tripDetails={tripDetails} />
      ) : (
        <Details tripId={tripDetails.id} />
      )}

      <View className="w-full absolute -bottom-1  self-center justify-end pb-5 z-10 bg-zinc-950">
        <View className="w-full flex-row justify-between bg-zinc-800 p-4 rounded-lg border border-zinc-700 gap-2">
          <Button
            className="w-48"
            onPress={() => setOption("activity")}
            variant={option === "activity" ? "primary" : "secondary"}
          >
            <CalendarRange
              color={
                option === "activity" ? colors.lime[950] : colors.zinc[200]
              }
              size={20}
            />
            <Button.Title>Atividades</Button.Title>
          </Button>

          <Button
            className="w-48"
            onPress={() => setOption("details")}
            variant={option === "details" ? "primary" : "secondary"}
          >
            <Info
              color={option === "details" ? colors.lime[950] : colors.zinc[200]}
              size={20}
            />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>

      <Modal
        title="Atualiza viagem"
        subtitle="Somente quem criou a viagem pode editar."
        visible={showModal === ModalEnum.UPDATE_TRIP}
        onClose={() => setShowModal(ModalEnum.NONE)}
      >
        <View className="gap-2 my-4">
          <Input variant="secondary">
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Para onde?"
              onChangeText={setDestination}
              value={destination}
            />
          </Input>
          <Input variant="secondary">
            <IconCalendar color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Quando?"
              onFocus={() => Keyboard.dismiss()}
              showSoftInputOnFocus={false}
              onPressIn={() => setShowModal(ModalEnum.CALENDAR)}
              value={selectedDates.formatDatesInText}
            />
          </Input>
          <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
            <Button.Title>Atualizar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione as datas de ida e volta de sua viagem"
        visible={showModal === ModalEnum.CALENDAR}
        onClose={() => setShowModal(ModalEnum.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
          />
          <Button onPress={() => setShowModal(ModalEnum.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}

import { useEffect, useState } from "react";
import { Alert, Image, Keyboard, Text, View } from "react-native";
import { router } from "expo-router";
import { DateData } from "react-native-calendars";
import dayjs from "dayjs";
import {
  MapPin,
  Calendar as IconCalendar,
  Settings2,
  UserRoundPlus,
  ArrowRight,
  AtSign,
} from "lucide-react-native";

import { tripServer } from "@/server/trip-server";
import { tripStorage } from "@/storage/trip";

import { colors } from "@/styles/colors";

import { validateInput } from "@/utils/validateInput";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";

import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { GuestEmail } from "@/components/email";
import { Loading } from "@/components/loading";

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL_GUESTS = 2,
}

enum ModalEnum {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export default function Index() {
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const [destination, setDestination] = useState("");
  const [emailToInvite, setEmailToInvite] = useState("");
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([]);

  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS);
  const [showModal, setShowModal] = useState(ModalEnum.NONE);

  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [isGettingTrip, setIsGettingTrip] = useState(true);

  function handleChangeLocationAndDate() {
    return setStepForm(StepForm.TRIP_DETAILS);
  }

  function handleNextStepForm() {
    if (
      destination.trim().length === 0 ||
      !selectedDates.startsAt ||
      !selectedDates.endsAt
    ) {
      return Alert.alert(
        "Detalhes da viagem",
        "Preencha todas as informações da viagem para seguir."
      );
    }

    if (destination.trim().length < 4) {
      return Alert.alert(
        "Detalhes da viagem",
        "O destino deve ter pelo menos 4 caracteres."
      );
    }

    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL_GUESTS);
    }

    Alert.alert("Nova viagem", "Confirmar viagem?", [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: createTrip },
    ]);
  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });
    setSelectedDates(dates);
  }

  function handleRemoveEmail(emailToRemove: string) {
    setEmailsToInvite((prevState) =>
      prevState.filter((email) => email !== emailToRemove)
    );
  }

  function handleAddEmail() {
    if (!validateInput.email(emailToInvite)) {
      return Alert.alert("Convidado", "E-mail inválido!");
    }

    if (emailsToInvite.includes(emailToInvite)) {
      return Alert.alert("Convidado", "E-mail já foi adicionado!");
    }

    setEmailsToInvite((prevState) => [...prevState, emailToInvite]);
    setEmailToInvite("");
  }

  async function saveTrip(tripId: string) {
    try {
      await tripStorage.save(tripId);
      router.navigate("/trip/" + tripId);
      setIsCreatingTrip(false);
    } catch (error) {
      Alert.alert(
        "Salvar viagem",
        "Não foi possível salvar o id da viagem no dispositivo."
      );
      console.log(error);
    }
  }

  async function createTrip() {
    try {
      setIsCreatingTrip(true);
      const newTrip = await tripServer.create({
        destination,
        starts_at: dayjs(selectedDates.startsAt?.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
        emails_to_invite: emailsToInvite,
      });
      Alert.alert("Nova viagem", "Viagem criada com sucesso!", [
        { text: "Continuar", onPress: () => saveTrip(newTrip.tripId) },
      ]);
    } catch (error) {
      console.log(error);
      setIsCreatingTrip(false);
    }
  }

  async function getTrip() {
    try {
      const tripId = await tripStorage.get();
      if (!tripId) {
        return setIsGettingTrip(false);
      }
      const trip = await tripServer.getById(tripId);
      if (trip) {
        return router.navigate("trip/" + tripId);
      }
    } catch (error) {
      setIsGettingTrip(false);
      console.log(error);
    }
  }

  useEffect(() => {
    getTrip();
  }, []);

  if (isGettingTrip) {
    return <Loading />;
  }

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image
        source={require("@/assets/logo.png")}
        className="h-8"
        resizeMode="contain"
      />

      <Image source={require("@/assets/bg.png")} className="absolute" />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        {"Convide seus amigos e planeje sua\npróxima viagem"}
      </Text>

      <View className="w-full bg-zinc-800 p-4 rounded-xl my-8 border border-zinc-700">
        <Input>
          <MapPin color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Para onde?"
            editable={stepForm === StepForm.TRIP_DETAILS}
            onChangeText={setDestination}
            value={destination}
          />
        </Input>

        <Input>
          <IconCalendar color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Quando?"
            editable={stepForm === StepForm.TRIP_DETAILS}
            onFocus={() => Keyboard.dismiss()}
            showSoftInputOnFocus={false}
            onPressIn={() =>
              stepForm === StepForm.TRIP_DETAILS &&
              setShowModal(ModalEnum.CALENDAR)
            }
            value={selectedDates.formatDatesInText}
          />
        </Input>

        {stepForm === StepForm.ADD_EMAIL_GUESTS && (
          <>
            <View className="border-b py-3 border-zinc-700">
              <Button onPress={handleChangeLocationAndDate} variant="secondary">
                <Button.Title>Alterar local e data</Button.Title>
                <Settings2 color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input>
              <UserRoundPlus color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Quem estará na viagem?"
                onFocus={() => Keyboard.dismiss()}
                showSoftInputOnFocus={false}
                onPressIn={() => setShowModal(ModalEnum.GUESTS)}
                autoCorrect={false}
                value={
                  emailsToInvite.length > 0
                    ? emailsToInvite.length === 1
                      ? "1 pessoa convidada"
                      : `${emailsToInvite.length} pessoas convidadas`
                    : ""
                }
              />
            </Input>
          </>
        )}
        <Button
          onPress={handleNextStepForm}
          variant="primary"
          isLoading={isCreatingTrip}
        >
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAILS
              ? "Continuar"
              : "Confirmar viagem"}
          </Button.Title>
          <ArrowRight color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-sm mt-3">
        Ao planejar sua viagem pela plann.er você automaticamente concorda
        nossos <Text className="text-zinc-300 underline">termos de uso</Text> e
        políticas de privacidade.
      </Text>

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
          <Button onPress={() => setShowModal(ModalEnum.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar convidados"
        subtitle="Os convidados irão receber e-mails para confirmar a participação na viagem."
        visible={showModal === ModalEnum.GUESTS}
        onClose={() => setShowModal(ModalEnum.NONE)}
      >
        <View className="my-2 flex-wrap gap-2 border-b border-zinc-700 py-5 items-start">
          {emailsToInvite.length > 0 ? (
            emailsToInvite.map((email) => (
              <GuestEmail
                key={email}
                email={email}
                onRemove={() => handleRemoveEmail(email)}
              />
            ))
          ) : (
            <Text className="text-zinc-500 text-base font-regular">
              Nenhum e-mail adicionado
            </Text>
          )}
        </View>

        <View className="gap-4 mt-4">
          <Input variant="secondary">
            <AtSign color={colors.zinc[400]} />
            <Input.Field
              placeholder="Digite o e-mail do convidado"
              keyboardType="email-address"
              onChangeText={(text) => setEmailToInvite(text.toLowerCase())}
              value={emailToInvite}
              returnKeyType="send"
              onSubmitEditing={handleAddEmail}
            />
          </Input>
          <Button onPress={handleAddEmail}>
            <Button.Title>Convidar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}

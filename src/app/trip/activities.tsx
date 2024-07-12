import { useEffect, useState } from "react";
import { View, Text, Keyboard, Alert, SectionList } from "react-native";
import dayjs from "dayjs";
import {
  PlusIcon,
  Tag,
  Calendar as IconCalendar,
  Clock,
} from "lucide-react-native";

import { TripData } from "./[id]";

import { activitiesServer } from "@/server/activities-server";

import { colors } from "@/styles/colors";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Input } from "@/components/input";
import { Calendar } from "@/components/calendar";
import { Loading } from "@/components/loading";
import { Activity, ActivityProps } from "@/components/activity";

type Props = {
  tripDetails: TripData;
};

enum ModalEnum {
  NONE = 0,
  CALENDAR = 1,
  NEW_ACTIVITY = 2,
}

type TripActivity = {
  title: {
    dayNumber: number;
    dayName: string;
  };
  data: ActivityProps[];
};

export function Activities({ tripDetails }: Props) {
  const [showModal, setShowModal] = useState(ModalEnum.NONE);

  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const [activityTitle, setActivityTitle] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityHour, setActivityHour] = useState("");

  const [tripActivities, setTripActivities] = useState<TripActivity[]>([]);

  function resetVewActivityFields() {
    setActivityTitle("");
    setActivityDate("");
    setActivityHour("");
  }

  async function handleCreateTripActivity() {
    try {
      setIsCreatingActivity(true);
      if (!activityTitle || !activityDate || !activityHour) {
        return Alert.alert("Cadastrar atividade", "Preencha todos os campos!");
      }
      await activitiesServer.create({
        tripId: tripDetails.id,
        occurs_at: dayjs(activityDate)
          .add(Number(activityHour), "h")
          .toString(),
        title: activityTitle,
      });
      Alert.alert(
        "Cadastrar atividade",
        "Nova atividade cadastrada com sucesso!"
      );
      resetVewActivityFields();
      await getTripActivities();
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingActivity(false);
      setShowModal(ModalEnum.NONE);
    }
  }

  async function getTripActivities() {
    try {
      const activities = await activitiesServer.getActivitiesByTripId(
        tripDetails.id
      );

      const activitiesToSectionList = activities.map((dayActivity) => ({
        title: {
          dayNumber: dayjs(dayActivity.date).date(),
          dayName: dayjs(dayActivity.date).format("dddd").replace("-feira", ""),
        },
        data: dayActivity.activities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          hour: dayjs(activity.occurs_at).format("hh[:]mm[h]"),
          isBefore: dayjs(activity.occurs_at).isBefore(dayjs()),
        })),
      }));

      setTripActivities(activitiesToSectionList);
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingActivity(false);
      setIsLoadingActivities(false);
    }
  }

  useEffect(() => {
    getTripActivities();
  }, []);

  return (
    <View className="flex-1">
      <View className="w-full flex-row mt-5 mb-6 items-center">
        <Text className="text-zinc-50 text-2xl font-semibold flex-1">
          Atividades
        </Text>
        <Button onPress={() => setShowModal(ModalEnum.NEW_ACTIVITY)}>
          <PlusIcon color={colors.lime[950]} size={20} />
          <Button.Title>Nova atividade</Button.Title>
        </Button>
      </View>

      {isLoadingActivities ? (
        <Loading />
      ) : (
        <SectionList
          sections={tripActivities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Activity data={item} />}
          renderSectionHeader={({ section }) => (
            <View className="w-full">
              <Text className="text-zinc-50 text-2xl font-semibold py-2">
                Dia {section.title.dayNumber + "  "}
                <Text className="text-zinc-500 text-base font-regular capitalize">
                  {section.title.dayName}
                </Text>
              </Text>
              {section.data.length === 0 && (
                <Text className="text-zinc-500 font-regular text-sm">
                  Nenhuma atividade cadastrada nessa data.
                </Text>
              )}
            </View>
          )}
          contentContainerClassName="gap-4 pb-28"
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        title="Cadastrar atividade"
        subtitle="Todos os convidados podem visualizar as atividades"
        visible={showModal === ModalEnum.NEW_ACTIVITY}
        onClose={() => setShowModal(ModalEnum.NONE)}
      >
        <View className="mt-4 mb-3">
          <Input variant="secondary">
            <Tag color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Qual atividade?"
              onChangeText={setActivityTitle}
              value={activityTitle}
            />
          </Input>
          <View className="w-full my-3 flex-row gap-2">
            <Input variant="secondary" className="flex-1">
              <IconCalendar color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Data"
                onFocus={() => Keyboard.dismiss()}
                showSoftInputOnFocus={false}
                onPressIn={() => setShowModal(ModalEnum.CALENDAR)}
                value={
                  activityDate ? dayjs(activityDate).format("DD [de] MMM") : ""
                }
              />
            </Input>

            <Input variant="secondary" className="flex-1">
              <Clock color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Horário"
                onChangeText={(text) =>
                  setActivityHour(text.replace(".", "").replace(",", ""))
                }
                value={activityHour}
                keyboardType="numeric"
                maxLength={2}
              />
            </Input>
          </View>
          <Button
            onPress={handleCreateTripActivity}
            isLoading={isCreatingActivity}
          >
            <Button.Title>Salvar atividade</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar data"
        subtitle="Selecione a data de sua atividade"
        visible={showModal === ModalEnum.CALENDAR}
        onClose={() => setShowModal(ModalEnum.NEW_ACTIVITY)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            onDayPress={(day) => setActivityDate(day.dateString)}
            minDate={tripDetails.starts_at}
            maxDate={tripDetails.ends_at}
            markedDates={{ [activityDate]: { selected: true } }}
          />
          <Button onPress={() => setShowModal(ModalEnum.NEW_ACTIVITY)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}

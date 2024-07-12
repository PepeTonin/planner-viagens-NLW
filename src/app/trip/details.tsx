import { useEffect, useState } from "react";
import { View, Text, Alert, FlatList } from "react-native";
import { Plus } from "lucide-react-native";

import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participants-server";

import { colors } from "@/styles/colors";

import { validateInput } from "@/utils/validateInput";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { Participant, ParticipantProps } from "@/components/participant";

export function Details({ tripId }: { tripId: string }) {
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);

  const [showNewLinkModal, setShowNewLinkModal] = useState(false);

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [links, setLinks] = useState<TripLinkProps[]>([]);
  const [participants, setParticipants] = useState<ParticipantProps[]>([]);

  function resetNewLinkFields() {
    setLinkTitle("");
    setLinkUrl("");
    setShowNewLinkModal(false);
  }

  async function handleCreateTripLink() {
    try {
      if (!validateInput.url(linkUrl.trim())) {
        return Alert.alert("Link", "URL inválido!");
      }
      if (!linkTitle.trim()) {
        return Alert.alert("Link", "Título inválido!");
      }
      setIsCreatingLinkTrip(true);
      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkUrl,
      });
      Alert.alert("Link", "Link criado com sucesso!");
      resetNewLinkFields();
      getTripLinks();
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsCreatingLinkTrip(false);
    }
  }

  async function getTripLinks() {
    try {
      const tripLinks = await linksServer.getLinksByTripId(tripId);
      setLinks(tripLinks);
      setIsLoadingLinks(false);
    } catch (error) {
      console.log("error", error);
    }
  }

  async function getTripParticipants() {
    try {
      const fetchedParticipants = await participantsServer.getByTripId(tripId);
      fetchedParticipants.forEach((participant) => {
        console.log(`${participant.email} - id: ${participant.id}`);
      });
      console.log("trip id: ", tripId);
      setParticipants(fetchedParticipants);
      setIsLoadingParticipants(false);
    } catch (error) {
      console.log("error", error);
    }
  }

  useEffect(() => {
    getTripLinks();
    getTripParticipants();
  }, []);

  return (
    <View className="flex-1">
      <View className="flex-1 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold mb-2">
          Links importantes
        </Text>
        {isLoadingLinks ? (
          <Loading />
        ) : (
          <>
            {links && links.length > 0 ? (
              <FlatList
                data={links}
                renderItem={({ item }) => <TripLink data={item} />}
                contentContainerClassName="gap-4 pb-36"
              />
            ) : (
              <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
                Nenhum link adicionado.
              </Text>
            )}

            <Button
              variant="secondary"
              onPress={() => setShowNewLinkModal(true)}
            >
              <Plus color={colors.zinc[200]} />
              <Button.Title>Cadastrar novo link</Button.Title>
            </Button>
          </>
        )}
      </View>

      <View className="flex-1 border-t border-zinc-700 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>
        {isLoadingParticipants ? (
          <Loading />
        ) : (
          <FlatList
            data={participants}
            renderItem={({ item }) => <Participant data={item} />}
            contentContainerClassName="gap-4 pb-36"
          />
        )}
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes."
        visible={showNewLinkModal}
        onClose={() => setShowNewLinkModal(false)}
      >
        <View className="gap-2 mb-3">
          <Input variant="secondary">
            <Input.Field
              placeholder="Título do link"
              onChangeText={setLinkTitle}
              value={linkTitle}
            />
          </Input>
          <Input variant="secondary">
            <Input.Field
              placeholder="URL"
              onChangeText={setLinkUrl}
              value={linkUrl}
            />
          </Input>
        </View>
        <Button isLoading={isCreatingLinkTrip} onPress={handleCreateTripLink}>
          <Button.Title>Salvar link</Button.Title>
        </Button>
      </Modal>
    </View>
  );
}

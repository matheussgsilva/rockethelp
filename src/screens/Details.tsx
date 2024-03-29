import React, { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { VStack, HStack, useTheme, Text, ScrollView, Box } from 'native-base';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { OrderProps } from '../components/Order';
import { CardDetails } from '../components/CardDetails';
import { OrderFirestoreDTO } from '../DTO/OrderFirestoreDTO';
import { dateFormat } from '../utils/firestoreDateFormat';
import { CircleWavyCheck, Hourglass, DesktopTower, ClipboardText } from 'phosphor-react-native'
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from 'react-native';

type RouteParams = {
  orderId: string;
}

type OrderDetails = OrderProps & {
  description: string
  solution: string
  closed: string
}

export function Details() {
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails)
  const [solution, setSolution] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const route = useRoute()
  const { orderId } = route.params as RouteParams
  const { colors } = useTheme()
  const navigation = useNavigation()

  function handleOrderClose() {
    if(!solution) {
      return Alert.alert('Solicitação', 'Iforme a solução para encerrar a solicitação.')
    }

    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .update({
      status: 'closed',
      solution,
      closed_at: firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      Alert.alert('Solicitação', 'Solicitação encerrada.')
      navigation.goBack()
    })
    .catch((error) => {
      console.log(error)
      Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação.')
    })
  }

  useEffect(() => {
    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .get()
    .then((doc) => {
      const { patrimony, description, status, created_at, closed_at, solution } = doc.data()

      const closed = closed_at ? dateFormat(closed_at) : null

      setOrder({
        id: doc.id,
        patrimony,
        description,
        status,
        solution,
        when: dateFormat(created_at),
        closed
      })

      setIsLoading(false)
    })
  }, [])

  if(isLoading) {
    <Loading />
  }

  return (
    <VStack flex={1} bg='gray.700' >
      <Box px={6} bg='gray.600' >
        <Header title='Solicitação' />
      </Box>
        <HStack bg='gray.500' justifyContent='center' p={4}>
          {
            order.status === 'closed'
            ? <CircleWavyCheck size={22} color={colors.green[300]} />
            : <Hourglass size={22} color={colors.secondary[700]} />
          }
          <Text
            fontSize='sm'
            color={order.status === 'closed' ? colors.green[300] : colors.secondary[700]}
            ml={2}
            textTransform='uppercase'
          >
            {order.status === 'closed' ? 'finalizado' : 'em andamento'}
          </Text>
        </HStack>
        <ScrollView mx={5} showsVerticalScrollIndicator={false} >
          <CardDetails 
            title='equipamento'
            description={`Patrimonio ${order.patrimony}`}
            icon={DesktopTower}
          />
          <CardDetails 
            title='Descrição do problema'
            description={order.description}
            icon={ClipboardText}
            footer={`Registrado em ${order.when}`}
          />
          <CardDetails 
            title='solução'
            icon={CircleWavyCheck}
            description={order.solution}
            footer={order.closed && `Encerrado em ${order.closed}`}
          >
            {order.status === 'open' &&
              <Input 
              placeholder='Descrição da solução'
              onChangeText={setSolution}
              h={24}
              textAlignVertical='top'
              multiline
              />
            }
          </CardDetails>
        </ScrollView>
        {
          order.status === 'open' &&
            <Button 
              title='Encerrar solicitação'
              m={5}
              onPress={handleOrderClose}
            />
        }
    </VStack>
  );
}
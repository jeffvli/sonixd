import {
  Button,
  Checkbox,
  Modal,
  ModalProps,
  PasswordInput,
  SegmentedControl,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useBooleanToggle } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useCreateServers, validateServer } from '../queries/useCreateServers';
import { useServers } from '../queries/useServers';
import { ServerList } from './ServerList';

export const ServersModal = ({ ...rest }: ModalProps) => {
  const { t } = useTranslation();
  const [createNew, toggleCreateNew] = useBooleanToggle(false);

  const form = useForm({
    initialValues: {
      legacyAuth: false,
      name: '',
      password: '',
      serverType: 'jellyfin',
      url: 'http://',
      username: '',
    },
  });

  const { data } = useServers({});

  const createServerMutation = useCreateServers();

  return (
    <Modal centered title={t('server.title')} {...rest}>
      <ServerList servers={data} />
      <Button variant="subtle" onClick={() => toggleCreateNew()}>
        {t('server.new')}
      </Button>
      {createNew && (
        <form
          onSubmit={form.onSubmit(async (values) => {
            const res = await validateServer(values);

            if (res?.token) {
              createServerMutation.mutateAsync({
                ...values,
                remoteUserId: res.userId,
                token: res.token,
              });
            }
          })}
        >
          <Stack>
            <SegmentedControl
              data={[
                { label: 'Jellyfin', value: 'jellyfin' },
                { label: 'Subsonic', value: 'subsonic' },
              ]}
              {...form.getInputProps('serverType')}
            />
            <TextInput
              required
              label={t('server.name')}
              {...form.getInputProps('name')}
            />
            <TextInput
              required
              label={t('server.url')}
              {...form.getInputProps('url')}
            />
            <TextInput
              required
              label={t('server.username')}
              {...form.getInputProps('username')}
            />
            <PasswordInput
              required
              label={t('server.password')}
              {...form.getInputProps('password')}
            />
            {form.getInputProps('serverType').value === 'subsonic' && (
              <Checkbox
                label={t('server.legacyauth')}
                {...form.getInputProps('legacyAuth', { type: 'checkbox' })}
              />
            )}
            <Button type="submit">{t('server.submit')}</Button>
          </Stack>
        </form>
      )}
    </Modal>
  );
};

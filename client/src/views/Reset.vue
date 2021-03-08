<template>
  <v-app>
    <v-container fluid>
      <v-row class="mt-10">
        <v-col cols="12">
          <p class="display-1 font-weight-regular" align="center">Dineat</p>
          <v-row class="mt-10 px-2" justify="center">
            <v-card tile elevation="5" width="500px">
              <v-row justify="center">
                <v-card-title class="title font-weight-regular"
                  >Set your Password
                </v-card-title>
              </v-row>
              <v-card-text class="px-7">
                <v-form ref="form" @submit.prevent>
                  <v-text-field
                    autofocus
                    v-model="password"
                    label="New password"
                    :value="password"
                    :type="viewPass ? 'text' : 'password'"
                    name="password"
                    :rules="[rules.isEmpty, rules.checkLen]"
                    :append-icon="viewPass ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="viewPass = !viewPass"
                    validate-on-blur
                  >
                  </v-text-field>
                  <v-text-field
                    v-model="confirm"
                    label="Confirm password"
                    :value="confirm"
                    :type="viewConfirmPass ? 'text' : 'password'"
                    :append-icon="viewConfirmPass ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="viewConfirmPass = !viewConfirmPass"
                    name="confirm"
                    :rules="[rules.isEmpty, rules.checkLen, match]"
                    validate-on-blur
                  >
                  </v-text-field>
                  <v-card-actions>
                    <v-row justify="center" class="mt-5">
                      <v-btn
                        color="primary"
                        type="submit"
                        tile
                        elevation="3"
                        width="100px"
                        @click="onSubmit"
                        :disabled="disabled"
                        >Submit</v-btn
                      >
                    </v-row>
                  </v-card-actions>
                </v-form>
              </v-card-text>
            </v-card>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar v-model="snackbar" :color="color" :timeout="timeout">{{
      message
    }}</v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: "Reset",
  data: () => ({
    password: "",
    confirm: "",
    snackbar: false,
    message: "",
    viewPass: false,
    viewConfirmPass: false,
    color: "",
    timeout: 6000,
    disabled: false,
    rules: {
      isEmpty: (v) => !!v || "Should not be empty",
      checkLen: (v) => v.length >= 8 || "Minimum 8 characters",
    },
  }),
  methods: {
    match() {
      return this.password === this.confirm || "Passwords aren't matching";
    },
    async onSubmit() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.disabled = true;
      try {
        const res = await fetch("/admit/enroll", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: this.$route.params.id,
            password: this.password,
          }),
        });
        const reply = await res.json();
        this.message = reply.msg;
        if (reply.valid) {
          this.color = "teal accent-4";
          this.snackbar = true;
        } else {
          this.color = "red lighten-1";
          this.snackbar = true;
        }
        setTimeout(() => {
          this.$router.push("/login");
        }, 4000);
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

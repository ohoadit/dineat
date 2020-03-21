<template>
  <v-app>
    <v-row justify="center" class="mt-10"> 
      <v-col cols="10" xs="10" sm="8" md="6" class="mt-10">
      <v-card tile elevation="5">
        <v-toolbar color="indigo white--text">
          <v-toolbar-title class="headline">
            Dineat
          </v-toolbar-title>
        </v-toolbar>
        <v-card-title class="subtitle font-weight-regular"
          >Set your Password
        </v-card-title>
        <v-card-text class="px-10">
          <v-form ref="form" @submit.prevent="onSubmit">
            <v-text-field
              autofocus
              v-model="password"
              label="New password"
              :value="password"
              type="password"
              name="password"
              :rules="[rules.isEmpty, rules.checkLen]"
            >
            </v-text-field>
            <v-text-field
              v-model="confirm"
              label="Confirm password"
              :value="confirm"
              type="password"
              name="confirm"
              :rules="[rules.isEmpty, rules.checkLen, match]"
            >
            </v-text-field>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                type="submit"
                tile
                elevation="3"
                width="100px"
                :disabled="disabled"
                >Submit</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
      </v-col>
    </v-row>
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
    color: "",
    timeout: 6000,
    disabled: false,
    rules: {
      isEmpty: v => !!v || "Should not be empty",
      checkLen: v => v.length >= 8 || "Minimum 8 characters"
    }
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            key: this.$route.params.id,
            password: this.password
          })
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
    }
  }
};
</script>
